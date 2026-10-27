-- =============================================
-- MIGRATION: PRD v3 Phase 3 — stores foundation (stores, store aliases, item aliases, linked merge)
-- DATE: 2026-10-25
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
-- Statements, in order:
--   1. CREATE OR REPLACE FUNCTION public.normalize_store_name — new pure function.
--   2. CREATE TABLE public.stores (+ unique indexes, updated_at trigger, RLS and four owner policies) — new, empty.
--   3. CREATE TABLE public.store_aliases (+ unique index, trigger, RLS, policies) — new, empty.
--   4. ALTER TABLE public.tickets ADD COLUMN store_id (nullable, no default) + composite FK + index. Existing rows get
--      NULL; no row is rewritten with a value. ON DELETE SET NULL (store_id) only clears that column when a store is
--      deleted, and only merge_stores deletes stores (after moving its receipts).
--   5. CREATE UNIQUE INDEX on public.base_list_items (id, base_list_id). id is already the primary key, so the index
--      cannot fail on existing data; it only exists as the target of the composite FK below.
--   6. CREATE TABLE public.base_list_item_aliases (+ composite FK ON DELETE CASCADE, unique index, trigger, RLS,
--      policies) — new, empty. The cascades fire only when a user deletes an item or a list, which they can already do.
--   7. CREATE OR REPLACE FUNCTION resolve_store, create_store, rename_store, assign_ticket_store, merge_stores,
--      ticket_item_matches — new functions; none runs at migration time.
--   8. DROP FUNCTION public.merge_ticket_items_to_base_list(UUID, UUID, UUID[], INTEGER) and CREATE the same function
--      with a fifth parameter p_links JSONB DEFAULT NULL. A function drop removes no data; both happen inside this
--      migration's transaction, so no caller sees the function missing. Calls by name without p_links keep working.
--
-- The DROP TRIGGER IF EXISTS lines only target triggers on the three new tables (they make a re-run idempotent).
-- At migration time nothing is DELETEd, UPDATEd, TRUNCATEd or backfilled; no existing table, column, index, policy or
-- enum is dropped, renamed or retyped. Runtime DELETEs exist only inside merge_stores (the merged-away store, after its
-- receipts and aliases moved) and the linked merge (the alias the user chose to forget).
-- =============================================

-- 1. Store name normalization -------------------------------------------------------------------------------------

-- "No Frills", "NOFRILLS", "no frills #123" and "No Frills 3127" all give 'nofrills'. A branch number is '#' plus
-- digits anywhere, or a trailing number of 3+ digits; shorter trailing numbers are kept because they are often part of
-- the name. NULL means "no usable key" (e.g. '#123' alone), so it can never become a store.
CREATE OR REPLACE FUNCTION public.normalize_store_name(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, extensions
AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;

  normalized := lower(unaccent(input_text));
  normalized := regexp_replace(normalized, '#\s*\d+', ' ', 'g');
  normalized := regexp_replace(normalized, '\s\d{3,}\s*$', '');
  normalized := regexp_replace(normalized, '[^a-z0-9]+', '', 'g');

  IF normalized = '' THEN
    RETURN NULL;
  END IF;

  RETURN normalized;
END;
$$;

-- 2. Stores --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name = btrim(name) AND char_length(name) BETWEEN 1 AND 100),
  normalized_name TEXT NOT NULL CHECK (normalized_name <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_user_id_normalized_name ON public.stores(user_id, normalized_name);
-- Target of the composite FKs that keep receipts and aliases on stores of the same user.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_id_user_id ON public.stores(id, user_id);

DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stores" ON public.stores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stores" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stores" ON public.stores
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stores" ON public.stores
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Store aliases: every key that resolves to a store, including the key of its current name -------------------------

CREATE TABLE IF NOT EXISTS public.store_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  alias_key TEXT NOT NULL CHECK (alias_key <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT store_aliases_store_fkey
    FOREIGN KEY (store_id, user_id) REFERENCES public.stores(id, user_id) ON DELETE CASCADE
);

-- One key resolves to at most one store of a user.
CREATE UNIQUE INDEX IF NOT EXISTS uq_store_aliases_user_id_alias_key ON public.store_aliases(user_id, alias_key);
CREATE INDEX IF NOT EXISTS idx_store_aliases_store_id ON public.store_aliases(store_id);

DROP TRIGGER IF EXISTS update_store_aliases_updated_at ON public.store_aliases;
CREATE TRIGGER update_store_aliases_updated_at
  BEFORE UPDATE ON public.store_aliases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.store_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store aliases" ON public.store_aliases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own store aliases" ON public.store_aliases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own store aliases" ON public.store_aliases
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own store aliases" ON public.store_aliases
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Receipts reference a store of their own user ---------------------------------------------------------------------

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS store_id UUID;

-- Composite FK: a receipt can only point at a store with the same user_id, even if application code got it wrong.
-- SET NULL (store_id) clears only that column; user_id is NOT NULL and must stay.
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_store_fkey
  FOREIGN KEY (store_id, user_id) REFERENCES public.stores(id, user_id) ON DELETE SET NULL (store_id);

CREATE INDEX IF NOT EXISTS idx_tickets_store_id ON public.tickets(store_id);

-- 5 + 6. Item aliases, remembered per list ----------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS uq_base_list_items_id_base_list_id ON public.base_list_items(id, base_list_id);

CREATE TABLE IF NOT EXISTS public.base_list_item_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_list_id UUID NOT NULL REFERENCES public.base_lists(id) ON DELETE CASCADE,
  base_list_item_id UUID NOT NULL,
  alias_key TEXT NOT NULL CHECK (alias_key <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT base_list_item_aliases_item_fkey
    FOREIGN KEY (base_list_item_id, base_list_id) REFERENCES public.base_list_items(id, base_list_id) ON DELETE CASCADE
);

-- One key resolves to at most one item of a list.
CREATE UNIQUE INDEX IF NOT EXISTS uq_base_list_item_aliases_list_key
  ON public.base_list_item_aliases(base_list_id, alias_key);
CREATE INDEX IF NOT EXISTS idx_base_list_item_aliases_item_id
  ON public.base_list_item_aliases(base_list_item_id);

DROP TRIGGER IF EXISTS update_base_list_item_aliases_updated_at ON public.base_list_item_aliases;
CREATE TRIGGER update_base_list_item_aliases_updated_at
  BEFORE UPDATE ON public.base_list_item_aliases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.base_list_item_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "List members can view item aliases" ON public.base_list_item_aliases
  FOR SELECT USING (
    public.current_user_owns_list(base_list_id) OR public.current_user_is_list_collaborator(base_list_id)
  );
CREATE POLICY "List owner can create item aliases" ON public.base_list_item_aliases
  FOR INSERT WITH CHECK (public.current_user_owns_list(base_list_id));
CREATE POLICY "List owner can update item aliases" ON public.base_list_item_aliases
  FOR UPDATE USING (public.current_user_owns_list(base_list_id)) WITH CHECK (public.current_user_owns_list(base_list_id));
CREATE POLICY "List owner can delete item aliases" ON public.base_list_item_aliases
  FOR DELETE USING (public.current_user_owns_list(base_list_id));

-- 7. Store functions -------------------------------------------------------------------------------------------------
-- Error codes read by the application: P0002 -> 404, 22023 -> 422, 23505 -> 409 (DETAIL = id of the store that has the
-- name), P0001 'Store limit reached' -> 409 LIMIT_EXCEEDED.

CREATE OR REPLACE FUNCTION public.resolve_store(p_raw_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_store_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT sa.store_id INTO v_store_id
  FROM public.store_aliases sa
  WHERE sa.user_id = v_user_id
    AND sa.alias_key = public.normalize_store_name(p_raw_name);

  RETURN v_store_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_store(p_name TEXT, p_max_stores INTEGER)
RETURNS public.stores
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_name TEXT;
  v_key TEXT;
  v_existing UUID;
  v_count INTEGER;
  v_store public.stores;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_name := btrim(regexp_replace(COALESCE(p_name, ''), '\s+', ' ', 'g'));
  v_key := public.normalize_store_name(v_name);

  IF char_length(v_name) NOT BETWEEN 1 AND 100 OR v_key IS NULL THEN
    RAISE EXCEPTION 'Invalid store name' USING ERRCODE = '22023';
  END IF;

  IF p_max_stores IS NULL OR p_max_stores < 1 THEN
    RAISE EXCEPTION 'Invalid store limit' USING ERRCODE = '22023';
  END IF;

  -- Serializes this user's store creations and renames so the limit and the key check cannot race.
  PERFORM pg_advisory_xact_lock(hashtextextended('stores:' || v_user_id::TEXT, 0));

  SELECT sa.store_id INTO v_existing
  FROM public.store_aliases sa
  WHERE sa.user_id = v_user_id AND sa.alias_key = v_key;

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'Store already exists' USING ERRCODE = '23505', DETAIL = v_existing::TEXT;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.stores WHERE user_id = v_user_id;

  IF v_count >= p_max_stores THEN
    RAISE EXCEPTION 'Store limit reached (%)', p_max_stores;
  END IF;

  INSERT INTO public.stores (user_id, name, normalized_name)
  VALUES (v_user_id, v_name, v_key)
  RETURNING * INTO v_store;

  INSERT INTO public.store_aliases (user_id, store_id, alias_key)
  VALUES (v_user_id, v_store.id, v_key);

  RETURN v_store;
END;
$$;

CREATE OR REPLACE FUNCTION public.rename_store(p_store_id UUID, p_name TEXT)
RETURNS public.stores
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_name TEXT;
  v_key TEXT;
  v_existing UUID;
  v_store public.stores;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_name := btrim(regexp_replace(COALESCE(p_name, ''), '\s+', ' ', 'g'));
  v_key := public.normalize_store_name(v_name);

  IF char_length(v_name) NOT BETWEEN 1 AND 100 OR v_key IS NULL THEN
    RAISE EXCEPTION 'Invalid store name' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('stores:' || v_user_id::TEXT, 0));

  SELECT * INTO v_store FROM public.stores WHERE id = p_store_id AND user_id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT sa.store_id INTO v_existing
  FROM public.store_aliases sa
  WHERE sa.user_id = v_user_id AND sa.alias_key = v_key;

  IF v_existing IS NOT NULL AND v_existing <> p_store_id THEN
    RAISE EXCEPTION 'Store already exists' USING ERRCODE = '23505', DETAIL = v_existing::TEXT;
  END IF;

  UPDATE public.stores
  SET name = v_name, normalized_name = v_key
  WHERE id = p_store_id
  RETURNING * INTO v_store;

  -- The previous key stays as an alias, so receipts printed with the old name still resolve here.
  INSERT INTO public.store_aliases (user_id, store_id, alias_key)
  VALUES (v_user_id, p_store_id, v_key)
  ON CONFLICT (user_id, alias_key) DO NOTHING;

  RETURN v_store;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_ticket_store(p_ticket_id UUID, p_store_id UUID)
RETURNS public.tickets
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_ticket public.tickets;
  v_key TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_ticket FROM public.tickets WHERE id = p_ticket_id AND user_id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_store_id IS NOT NULL THEN
    PERFORM 1 FROM public.stores WHERE id = p_store_id AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  UPDATE public.tickets SET store_id = p_store_id WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  v_key := public.normalize_store_name(v_ticket.store_name);

  -- The user's explicit choice teaches the raw name, re-pointing an alias of another store if needed, except when the
  -- key is another store's own current name: taking it would leave that store unable to resolve its own name.
  IF p_store_id IS NOT NULL
    AND v_key IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.user_id = v_user_id AND s.normalized_name = v_key AND s.id <> p_store_id
    ) THEN
    INSERT INTO public.store_aliases (user_id, store_id, alias_key)
    VALUES (v_user_id, p_store_id, v_key)
    ON CONFLICT (user_id, alias_key) DO UPDATE
      SET store_id = EXCLUDED.store_id
      WHERE store_aliases.store_id <> EXCLUDED.store_id;
  END IF;

  RETURN v_ticket;
END;
$$;

CREATE OR REPLACE FUNCTION public.merge_stores(p_target_id UUID, p_source_id UUID)
RETURNS public.stores
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_locked INTEGER;
  v_store public.stores;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_target_id IS NULL OR p_source_id IS NULL OR p_target_id = p_source_id THEN
    RAISE EXCEPTION 'Cannot merge a store into itself' USING ERRCODE = '22023';
  END IF;

  -- Locking both rows in id order keeps two crossed merges from deadlocking.
  SELECT COUNT(*) INTO v_locked
  FROM (
    SELECT s.id FROM public.stores s
    WHERE s.id IN (p_target_id, p_source_id) AND s.user_id = v_user_id
    ORDER BY s.id
    FOR UPDATE
  ) locked;

  IF v_locked < 2 THEN
    RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.tickets SET store_id = p_target_id WHERE user_id = v_user_id AND store_id = p_source_id;
  -- Keys are unique per user, so moving them cannot collide; the source's own name becomes an alias of the target.
  UPDATE public.store_aliases SET store_id = p_target_id WHERE user_id = v_user_id AND store_id = p_source_id;
  DELETE FROM public.stores WHERE id = p_source_id AND user_id = v_user_id;

  SELECT * INTO v_store FROM public.stores WHERE id = p_target_id;
  RETURN v_store;
END;
$$;

-- 7b. How each receipt line matches a list: exact name first, then a remembered alias, otherwise new -------------------

CREATE OR REPLACE FUNCTION public.ticket_item_matches(p_ticket_id UUID, p_base_list_id UUID)
RETURNS TABLE(ticket_item_id UUID, match_kind TEXT, base_list_item_id UUID, base_list_item_name TEXT)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM 1 FROM public.tickets t WHERE t.id = p_ticket_id AND t.user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM public.base_lists bl WHERE bl.id = p_base_list_id AND bl.user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Base list not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  SELECT
    ti.id,
    CASE WHEN by_name.id IS NOT NULL THEN 'name' WHEN by_alias.id IS NOT NULL THEN 'alias' ELSE 'none' END,
    COALESCE(by_name.id, by_alias.id),
    COALESCE(by_name.name, by_alias.name)
  FROM public.ticket_items ti
  LEFT JOIN public.base_list_items by_name
    ON by_name.base_list_id = p_base_list_id
   AND by_name.normalized_name = ti.normalized_name
   AND COALESCE(ti.normalized_name, '') <> ''
  LEFT JOIN LATERAL (
    SELECT bli.id, bli.name
    FROM public.base_list_item_aliases a
    JOIN public.base_list_items bli ON bli.id = a.base_list_item_id
    WHERE a.base_list_id = p_base_list_id
      AND a.alias_key = ti.normalized_name
  ) by_alias ON by_name.id IS NULL
  WHERE ti.ticket_id = p_ticket_id
  ORDER BY ti.created_at, ti.id;
END;
$$;

-- 8. Merge receipt lines into a list, applying the user's links ------------------------------------------------------

DROP FUNCTION IF EXISTS public.merge_ticket_items_to_base_list(UUID, UUID, UUID[], INTEGER);

-- p_links: [{ "ticket_item_id": uuid, "base_list_item_id": uuid | null }, ...]
--   an item id  -> the line updates that item and its name is remembered as an alias of it in this list;
--   null        -> the line is added as a new item and any alias of its name in this list is forgotten.
-- Lines without a link: same name -> update; remembered alias -> update that item; otherwise -> new item.
CREATE FUNCTION public.merge_ticket_items_to_base_list(
  p_ticket_id UUID,
  p_base_list_id UUID,
  p_item_ids UUID[] DEFAULT NULL,
  p_max_items INTEGER DEFAULT 250,
  p_links JSONB DEFAULT NULL
)
RETURNS TABLE(new_count INTEGER, updated_count INTEGER, skipped_count INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_current_count INTEGER;
  v_potential_new_count INTEGER;
  v_link_items UUID[] := ARRAY[]::UUID[];
  v_link_targets UUID[] := ARRAY[]::UUID[];
  v_invalid INTEGER;
  v_target_id UUID;
  v_link_target UUID;
  v_price NUMERIC;
  v_sort_order INTEGER;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM 1
  FROM public.tickets t
  WHERE t.id = p_ticket_id
    AND t.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT bl.group_id INTO v_group_id
  FROM public.base_lists bl
  WHERE bl.id = p_base_list_id
    AND bl.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Base list not found' USING ERRCODE = 'P0002';
  END IF;

  -- Links are validated before anything is written.
  IF p_links IS NOT NULL THEN
    IF jsonb_typeof(p_links) <> 'array' THEN
      RAISE EXCEPTION 'Invalid links' USING ERRCODE = '22023';
    END IF;

    SELECT
      COALESCE(array_agg((e ->> 'ticket_item_id')::UUID ORDER BY ord), ARRAY[]::UUID[]),
      COALESCE(array_agg(NULLIF(e ->> 'base_list_item_id', '')::UUID ORDER BY ord), ARRAY[]::UUID[])
    INTO v_link_items, v_link_targets
    FROM jsonb_array_elements(p_links) WITH ORDINALITY AS l(e, ord);

    IF array_position(v_link_items, NULL) IS NOT NULL
      OR (SELECT COUNT(DISTINCT x) FROM unnest(v_link_items) x) <> cardinality(v_link_items) THEN
      RAISE EXCEPTION 'Each link needs a distinct receipt line' USING ERRCODE = '22023';
    END IF;

    SELECT COUNT(*) INTO v_invalid
    FROM unnest(v_link_items) li(item_id)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.ticket_items ti
      WHERE ti.id = li.item_id
        AND ti.ticket_id = p_ticket_id
        AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids))
    );

    IF v_invalid > 0 THEN
      RAISE EXCEPTION 'A linked line is not one of the selected receipt lines' USING ERRCODE = '22023';
    END IF;

    SELECT COUNT(*) INTO v_invalid
    FROM unnest(v_link_targets) lt(target)
    WHERE lt.target IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.base_list_items bli
        WHERE bli.id = lt.target AND bli.base_list_id = p_base_list_id
      );

    IF v_invalid > 0 THEN
      RAISE EXCEPTION 'A linked item is not in this list' USING ERRCODE = '22023';
    END IF;

    SELECT COUNT(*) INTO v_invalid
    FROM unnest(v_link_items) li(item_id)
    JOIN public.ticket_items ti ON ti.id = li.item_id
    JOIN public.base_list_items bli
      ON bli.base_list_id = p_base_list_id AND bli.normalized_name = ti.normalized_name;

    IF v_invalid > 0 THEN
      RAISE EXCEPTION 'A line with the name of an item in this list cannot be linked to another item' USING ERRCODE = '22023';
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.base_list_items
  WHERE base_list_id = p_base_list_id;

  -- Only lines that end up creating an item count against the limit (shared matching rules: ticket_item_matches).
  WITH links AS (
    SELECT * FROM unnest(v_link_items, v_link_targets) AS l(item_id, target)
  ),
  selected AS (
    SELECT ti.id, ti.normalized_name, m.match_kind
    FROM public.ticket_items ti
    JOIN public.ticket_item_matches(p_ticket_id, p_base_list_id) m ON m.ticket_item_id = ti.id
    WHERE ti.ticket_id = p_ticket_id
      AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids))
      AND COALESCE(ti.normalized_name, '') <> ''
  )
  SELECT COUNT(DISTINCT s.normalized_name) INTO v_potential_new_count
  FROM selected s
  LEFT JOIN links l ON l.item_id = s.id
  WHERE s.match_kind <> 'name'
    AND NOT (l.item_id IS NOT NULL AND l.target IS NOT NULL)
    AND NOT (l.item_id IS NULL AND s.match_kind = 'alias')
    -- a line whose name another selected line links to an item will find that alias when its turn comes
    AND NOT EXISTS (
      SELECT 1 FROM selected s2 JOIN links l2 ON l2.item_id = s2.id
      WHERE s2.normalized_name = s.normalized_name AND l2.target IS NOT NULL
    );

  IF v_current_count + v_potential_new_count > p_max_items THEN
    RAISE EXCEPTION 'Cannot merge items. This would exceed the maximum limit of % items per list (current: %, trying to add: %).',
      p_max_items, v_current_count, v_potential_new_count;
  END IF;

  new_count := 0;
  updated_count := 0;
  skipped_count := 0;

  FOR rec IN
    SELECT ti.*
    FROM public.ticket_items ti
    WHERE ti.ticket_id = p_ticket_id
      AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids))
    ORDER BY ti.created_at, ti.id
  LOOP
    IF rec.normalized_name IS NULL OR rec.normalized_name = '' THEN
      skipped_count := skipped_count + 1;
      CONTINUE;
    END IF;

    -- Looked up line by line, so a second line with the same name finds the item the first one created.
    v_target_id := NULL;

    SELECT bli.id INTO v_target_id
    FROM public.base_list_items bli
    WHERE bli.base_list_id = p_base_list_id
      AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    IF v_target_id IS NULL THEN
      SELECT l.target INTO v_link_target
      FROM unnest(v_link_items, v_link_targets) AS l(item_id, target)
      WHERE l.item_id = rec.id;

      IF FOUND THEN
        IF v_link_target IS NOT NULL THEN
          SELECT bli.id INTO v_target_id
          FROM public.base_list_items bli
          WHERE bli.id = v_link_target AND bli.base_list_id = p_base_list_id
          FOR UPDATE;

          INSERT INTO public.base_list_item_aliases (base_list_id, base_list_item_id, alias_key)
          VALUES (p_base_list_id, v_target_id, rec.normalized_name)
          ON CONFLICT (base_list_id, alias_key) DO UPDATE
            SET base_list_item_id = EXCLUDED.base_list_item_id
            WHERE base_list_item_aliases.base_list_item_id <> EXCLUDED.base_list_item_id;
        ELSE
          DELETE FROM public.base_list_item_aliases
          WHERE base_list_id = p_base_list_id AND alias_key = rec.normalized_name;
        END IF;
      ELSE
        SELECT bli.id INTO v_target_id
        FROM public.base_list_item_aliases a
        JOIN public.base_list_items bli ON bli.id = a.base_list_item_id
        WHERE a.base_list_id = p_base_list_id
          AND a.alias_key = rec.normalized_name
        FOR UPDATE OF bli;
      END IF;
    END IF;

    v_price := rec.price;

    IF v_target_id IS NOT NULL THEN
      UPDATE public.base_list_items
      SET
        quantity = COALESCE(base_list_items.quantity, 0) + COALESCE(rec.quantity, 1),
        unit = COALESCE(base_list_items.unit, rec.unit),
        category = COALESCE(base_list_items.category, rec.category),
        purchase_count = COALESCE(base_list_items.purchase_count, 0) + 1,
        last_purchased_at = NOW(),
        average_price = CASE
          WHEN v_price IS NULL THEN base_list_items.average_price
          WHEN base_list_items.average_price IS NULL THEN v_price
          ELSE ((base_list_items.average_price * GREATEST(COALESCE(base_list_items.purchase_count, 0), 0)) + v_price)
               / (GREATEST(COALESCE(base_list_items.purchase_count, 0), 0) + 1)
        END,
        updated_at = NOW()
      WHERE id = v_target_id;

      updated_count := updated_count + 1;
    ELSE
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items
      WHERE base_list_id = p_base_list_id;

      INSERT INTO public.base_list_items (
        base_list_id,
        name,
        quantity,
        unit,
        category,
        sort_order,
        normalized_name,
        purchase_count,
        first_seen_at,
        last_purchased_at,
        average_price
      ) VALUES (
        p_base_list_id,
        rec.name,
        COALESCE(rec.quantity, 1),
        rec.unit,
        rec.category,
        v_sort_order,
        rec.normalized_name,
        1,
        NOW(),
        NOW(),
        v_price
      );

      new_count := new_count + 1;
    END IF;
  END LOOP;

  UPDATE public.tickets
  SET
    base_list_id = p_base_list_id,
    group_id = v_group_id
  WHERE id = p_ticket_id
    AND user_id = v_user_id;

  RETURN QUERY SELECT new_count, updated_count, skipped_count;
END;
$$;
