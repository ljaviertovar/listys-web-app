-- Non-destructive migration review (AGENTS.md):
--   1. CREATE TABLE base_list_item_store_stats adds an empty table; no existing rows are read or rewritten.
--   2. CREATE INDEX / CREATE POLICY / CREATE TRIGGER add indexes and access/integrity rules only.
--   3. ALTER TABLE statements add nullable or constant-default columns; PostgreSQL 11+ does not rewrite rows for a
--      constant default. No backfill is performed.
--   4. CREATE UNIQUE INDEX fails atomically if a list already has multiple active sessions; it does not resolve or
--      remove them. Verify the precondition before applying.
--   5. CREATE OR REPLACE FUNCTION preserves all existing function signatures. DML in function bodies runs only when a
--      user invokes the corresponding learning, merge, session-start, completion, or tag command.
--   6. Runtime DELETE statements only remove alias/statistics rows during an explicitly requested item/store merge;
--      the new ON DELETE CASCADE / SET NULL constraints run only for item/store deletes the user already performs.
--   7. No migration-time DELETE, UPDATE, TRUNCATE, DROP, or historical-data backfill is present.

CREATE TABLE public.base_list_item_store_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_list_item_id UUID NOT NULL REFERENCES public.base_list_items(id) ON DELETE CASCADE,
  store_id UUID NOT NULL,
  purchase_count INTEGER NOT NULL DEFAULT 0 CHECK (purchase_count >= 0),
  last_purchased_at TIMESTAMPTZ NOT NULL,
  last_price NUMERIC,
  last_price_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT base_list_item_store_stats_store_owner_fkey
    FOREIGN KEY (store_id, user_id) REFERENCES public.stores(id, user_id) ON DELETE CASCADE,
  CONSTRAINT base_list_item_store_stats_item_store_unique UNIQUE (base_list_item_id, store_id)
);

CREATE INDEX idx_base_list_item_store_stats_store_id
  ON public.base_list_item_store_stats(store_id);
CREATE INDEX idx_base_list_item_store_stats_user_id
  ON public.base_list_item_store_stats(user_id);

CREATE TRIGGER update_base_list_item_store_stats_updated_at
  BEFORE UPDATE ON public.base_list_item_store_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.base_list_item_store_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own item store statistics"
  ON public.base_list_item_store_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own item store statistics"
  ON public.base_list_item_store_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own item store statistics"
  ON public.base_list_item_store_stats FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own item store statistics"
  ON public.base_list_item_store_stats FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.base_list_items
  ADD COLUMN usual_store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  ADD COLUMN usual_store_source TEXT NOT NULL DEFAULT 'auto'
    CHECK (usual_store_source IN ('auto', 'manual'));

ALTER TABLE public.shopping_sessions
  ADD COLUMN store_id UUID,
  ADD CONSTRAINT shopping_sessions_store_owner_fkey
    FOREIGN KEY (store_id, user_id) REFERENCES public.stores(id, user_id) ON DELETE SET NULL (store_id);
CREATE INDEX idx_shopping_sessions_store_id ON public.shopping_sessions(store_id);

ALTER TABLE public.shopping_session_items
  ADD COLUMN is_other_store BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX uq_shopping_sessions_one_active_per_list
  ON public.shopping_sessions(base_list_id) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.guard_item_store_stats_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_setting('listys.learning', TRUE) = 'on' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Cascades from deleting the parent item remain possible without opening direct writes.
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1 FROM public.base_list_items bli WHERE bli.id = OLD.base_list_item_id
  ) THEN
    RETURN OLD;
  END IF;

  RAISE EXCEPTION 'Item store statistics can only be changed by learning operations' USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER guard_base_list_item_store_stats_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.base_list_item_store_stats
  FOR EACH ROW EXECUTE FUNCTION public.guard_item_store_stats_write();

CREATE OR REPLACE FUNCTION public.guard_base_list_item_usual_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT'
    AND NEW.usual_store_id IS NULL
    AND NEW.usual_store_source = 'auto' THEN
    RETURN NEW;
  END IF;

  -- Foreign-key cascades such as account deletion are not user initiated field edits.
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  SELECT bl.user_id INTO v_owner_id
  FROM public.base_lists bl WHERE bl.id = NEW.base_list_id;

  IF v_owner_id IS DISTINCT FROM auth.uid()
    OR current_setting('listys.learning', TRUE) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Usual store can only be changed by the list owner through learning operations' USING ERRCODE = '42501';
  END IF;

  IF NEW.usual_store_id IS NOT DISTINCT FROM OLD.usual_store_id
    AND NEW.usual_store_source IS NOT DISTINCT FROM OLD.usual_store_source THEN
    RETURN NEW;
  END IF;

  IF NEW.usual_store_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = NEW.usual_store_id AND s.user_id = v_owner_id
  ) THEN
    RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_base_list_item_usual_store
  BEFORE INSERT OR UPDATE OF usual_store_id, usual_store_source ON public.base_list_items
  FOR EACH ROW EXECUTE FUNCTION public.guard_base_list_item_usual_store();

CREATE OR REPLACE FUNCTION public.recompute_usual_store(p_item_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_item_id UUID;
  v_latest TIMESTAMPTZ;
  v_store_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF current_setting('listys.learning', TRUE) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Usual store can only be recomputed by learning operations' USING ERRCODE = '42501';
  END IF;

  -- The 180-day window and three-purchase threshold are product rules; the window is relative to each item's latest
  -- purchase, so its result does not age out without another learning event.
  FOREACH v_item_id IN ARRAY COALESCE(p_item_ids, ARRAY[]::UUID[])
  LOOP
    SELECT MAX(s.last_purchased_at) INTO v_latest
    FROM public.base_list_item_store_stats s
    WHERE s.base_list_item_id = v_item_id AND s.user_id = auth.uid();

    SELECT s.store_id INTO v_store_id
    FROM public.base_list_item_store_stats s
    WHERE s.base_list_item_id = v_item_id
      AND s.user_id = auth.uid()
      AND s.purchase_count >= 3
      AND s.last_purchased_at >= v_latest - INTERVAL '180 days'
    ORDER BY s.purchase_count DESC, s.last_purchased_at DESC, s.store_id
    LIMIT 1;

    UPDATE public.base_list_items bli
    SET usual_store_id = v_store_id
    FROM public.base_lists bl
    WHERE bli.id = v_item_id AND bl.id = bli.base_list_id AND bl.user_id = auth.uid()
      AND bli.usual_store_source = 'auto'
      AND bli.usual_store_id IS DISTINCT FROM v_store_id;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_usual_store(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recompute_usual_store(UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_item_usual_store(p_item_id UUID, p_store_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, usual_store_id UUID, usual_store_source TEXT)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_result public.base_list_items;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT bl.user_id INTO v_owner_id
  FROM public.base_list_items bli JOIN public.base_lists bl ON bl.id = bli.base_list_id
  WHERE bli.id = p_item_id;
  IF v_owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Item not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_store_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = p_store_id AND s.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('listys.learning', 'on', TRUE);
  UPDATE public.base_list_items
  SET usual_store_id = p_store_id,
      usual_store_source = CASE WHEN p_store_id IS NULL THEN 'auto' ELSE 'manual' END
  WHERE base_list_items.id = p_item_id
  RETURNING base_list_items.* INTO v_result;

  IF p_store_id IS NULL THEN
    PERFORM public.recompute_usual_store(ARRAY[p_item_id]);
    SELECT * INTO v_result FROM public.base_list_items WHERE base_list_items.id = p_item_id;
  END IF;

  RETURN QUERY SELECT v_result.id, v_result.usual_store_id, v_result.usual_store_source;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_shopping_session(
  p_base_list_id UUID,
  p_name TEXT,
  p_store_id UUID DEFAULT NULL
)
RETURNS public.shopping_sessions
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session public.shopping_sessions;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  PERFORM 1 FROM public.base_lists bl WHERE bl.id = p_base_list_id AND bl.user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Base list not found' USING ERRCODE = 'P0002'; END IF;

  IF p_store_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = p_store_id AND s.user_id = v_user_id
  ) THEN RAISE EXCEPTION 'Store not found' USING ERRCODE = 'P0002'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.base_list_items bli WHERE bli.base_list_id = p_base_list_id) THEN
    RAISE EXCEPTION 'LIST_EMPTY' USING ERRCODE = 'P0001';
  END IF;

  BEGIN
    INSERT INTO public.shopping_sessions (base_list_id, user_id, name, status, store_id)
    VALUES (p_base_list_id, v_user_id, btrim(p_name), 'active', p_store_id)
    RETURNING * INTO v_session;
  EXCEPTION WHEN unique_violation THEN
    SELECT ss.id INTO v_session.id FROM public.shopping_sessions ss
    WHERE ss.base_list_id = p_base_list_id AND ss.status = 'active';
    RAISE EXCEPTION 'SESSION_ALREADY_ACTIVE' USING ERRCODE = '23505', DETAIL = v_session.id::TEXT;
  END;

  INSERT INTO public.shopping_session_items (
    shopping_session_id, name, quantity, unit, notes, category, sort_order, normalized_name,
    checked, price, is_other_store
  )
  SELECT v_session.id, ordered.name, ordered.quantity, ordered.unit, ordered.notes, ordered.category,
    ordered.session_sort_order, ordered.normalized_name, FALSE, NULL,
    CASE WHEN p_store_id IS NULL THEN FALSE ELSE NOT (
      COALESCE(ordered.usual_store_id = p_store_id, FALSE) OR EXISTS (
        SELECT 1 FROM public.base_list_item_store_stats stats
        WHERE stats.base_list_item_id = ordered.id AND stats.store_id = p_store_id
      )
    ) END
  FROM (
    SELECT bli.*,
      ROW_NUMBER() OVER (
        ORDER BY COALESCE(bli.purchase_count, 0) DESC,
          bli.last_purchased_at DESC NULLS LAST, COALESCE(bli.sort_order, 0), bli.id
      ) - 1 AS session_sort_order
    FROM public.base_list_items bli
    WHERE bli.base_list_id = p_base_list_id
  ) ordered;

  RETURN v_session;
END;
$$;


-- Existing receipt merge contract extended with per-store purchase learning. The signature is unchanged.
CREATE OR REPLACE FUNCTION public.merge_ticket_items_to_base_list(
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
  v_store_id UUID;
  v_item_id UUID;
  v_learning_item_ids UUID[] := ARRAY[]::UUID[];
  v_learning_prices JSONB := '{}'::JSONB;
  v_line_price NUMERIC;
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

  SELECT t.store_id INTO v_store_id FROM public.tickets t WHERE t.id = p_ticket_id AND t.user_id = v_user_id;

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
      ) RETURNING id INTO v_target_id;

      new_count := new_count + 1;
    END IF;

    IF v_store_id IS NOT NULL AND v_target_id IS NOT NULL THEN
      IF NOT (v_target_id = ANY(v_learning_item_ids)) THEN
        v_learning_item_ids := array_append(v_learning_item_ids, v_target_id);
      END IF;
      IF v_price IS NOT NULL THEN
        v_learning_prices := v_learning_prices || jsonb_build_object(v_target_id::TEXT, v_price);
      END IF;
    END IF;
  END LOOP;

  IF v_store_id IS NOT NULL AND cardinality(v_learning_item_ids) > 0 THEN
    PERFORM set_config('listys.learning', 'on', TRUE);
    FOREACH v_item_id IN ARRAY v_learning_item_ids LOOP
      v_line_price := NULLIF(v_learning_prices ->> v_item_id::TEXT, '')::NUMERIC;
      INSERT INTO public.base_list_item_store_stats (
        user_id, base_list_item_id, store_id, purchase_count, last_purchased_at, last_price, last_price_at
      ) VALUES (
        v_user_id, v_item_id, v_store_id, 1, NOW(), v_line_price, CASE WHEN v_line_price IS NULL THEN NULL ELSE NOW() END
      )
      ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
        purchase_count = base_list_item_store_stats.purchase_count + 1,
        last_purchased_at = EXCLUDED.last_purchased_at,
        last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
        last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at);
    END LOOP;
    PERFORM public.recompute_usual_store(v_learning_item_ids);
  END IF;

  UPDATE public.tickets
  SET
    base_list_id = p_base_list_id,
    group_id = v_group_id
  WHERE id = p_ticket_id
    AND user_id = v_user_id;

  RETURN QUERY SELECT new_count, updated_count, skipped_count;
END;
$$;

-- Existing session completion contract extended with per-store purchase learning. The signature is unchanged.
CREATE OR REPLACE FUNCTION public.complete_shopping_session(
  p_session_id UUID,
  p_total_amount NUMERIC DEFAULT NULL,
  p_general_notes TEXT DEFAULT NULL,
  p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(new_count INTEGER, updated_count INTEGER, skipped_count INTEGER, over_limit_count INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_base_list_id UUID;
  v_status TEXT;
  v_current_count INTEGER;
  v_capacity INTEGER;
  v_existing RECORD;
  v_sort_order INTEGER;
  v_store_id UUID;
  v_learning_item_ids UUID[] := ARRAY[]::UUID[];
  v_item_id UUID;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- The row lock serializes concurrent completions: the second one sees 'completed' and fails without effects.
  SELECT ss.base_list_id, ss.status::TEXT, ss.store_id INTO v_base_list_id, v_status, v_store_id
  FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id
    AND ss.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'SESSION_NOT_ACTIVE';
  END IF;

  -- Serializes capacity accounting between completions that target the same list.
  PERFORM 1 FROM public.base_lists WHERE id = v_base_list_id FOR UPDATE;

  UPDATE public.shopping_sessions
  SET
    status = 'completed',
    completed_at = NOW(),
    sync_to_base = TRUE,
    total_amount = COALESCE(p_total_amount, total_amount),
    general_notes = COALESCE(p_general_notes, general_notes),
    updated_at = NOW()
  WHERE id = p_session_id;

  SELECT COUNT(*) INTO v_current_count
  FROM public.base_list_items
  WHERE base_list_id = v_base_list_id;

  v_capacity := GREATEST(COALESCE(p_max_items, 250) - v_current_count, 0);

  new_count := 0;
  updated_count := 0;
  over_limit_count := 0;

  -- Checked items whose name normalizes to nothing cannot be matched or stored.
  SELECT COUNT(*)::INTEGER INTO skipped_count
  FROM public.shopping_session_items ssi
  WHERE ssi.shopping_session_id = p_session_id
    AND COALESCE(ssi.checked, FALSE) = TRUE
    AND (ssi.normalized_name IS NULL OR ssi.normalized_name = '');

  -- One purchase per distinct item per trip, applied in the order the items appear in the session.
  FOR rec IN
    SELECT d.*
    FROM (
      SELECT DISTINCT ON (ssi.normalized_name) ssi.*
      FROM public.shopping_session_items ssi
      WHERE ssi.shopping_session_id = p_session_id
        AND COALESCE(ssi.checked, FALSE) = TRUE
        AND ssi.normalized_name IS NOT NULL
        AND ssi.normalized_name <> ''
      ORDER BY ssi.normalized_name, ssi.sort_order, ssi.id
    ) d
    ORDER BY d.sort_order, d.id
  LOOP
    SELECT * INTO v_existing
    FROM public.base_list_items bli
    WHERE bli.base_list_id = v_base_list_id
      AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.base_list_items
      SET
        quantity = rec.quantity,
        unit = rec.unit,
        notes = rec.notes,
        category = rec.category,
        purchase_count = COALESCE(base_list_items.purchase_count, 0) + 1,
        last_purchased_at = NOW(),
        average_price = CASE
          WHEN rec.price IS NULL THEN base_list_items.average_price
          WHEN base_list_items.average_price IS NULL THEN rec.price
          ELSE ((base_list_items.average_price * GREATEST(COALESCE(base_list_items.purchase_count, 0), 0)) + rec.price)
               / (GREATEST(COALESCE(base_list_items.purchase_count, 0), 0) + 1)
        END,
        updated_at = NOW()
      WHERE id = v_existing.id;

      v_learning_item_ids := array_append(v_learning_item_ids, v_existing.id);
      updated_count := updated_count + 1;
    ELSIF v_capacity > 0 THEN
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items
      WHERE base_list_id = v_base_list_id;

      INSERT INTO public.base_list_items (
        base_list_id,
        name,
        quantity,
        unit,
        notes,
        category,
        sort_order,
        normalized_name,
        purchase_count,
        first_seen_at,
        last_purchased_at,
        average_price
      ) VALUES (
        v_base_list_id,
        rec.name,
        COALESCE(rec.quantity, 1),
        rec.unit,
        rec.notes,
        rec.category,
        v_sort_order,
        rec.normalized_name,
        1,
        NOW(),
        NOW(),
        rec.price
      ) RETURNING id INTO v_item_id;

      v_learning_item_ids := array_append(v_learning_item_ids, v_item_id);
      v_capacity := v_capacity - 1;
      new_count := new_count + 1;
    ELSE
      skipped_count := skipped_count + 1;
      over_limit_count := over_limit_count + 1;
    END IF;
  END LOOP;

  IF v_store_id IS NOT NULL AND cardinality(v_learning_item_ids) > 0 THEN
    PERFORM set_config('listys.learning', 'on', TRUE);
    INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, purchase_count, last_purchased_at)
    SELECT v_user_id, learned.item_id, v_store_id, 1, NOW()
    FROM (SELECT DISTINCT unnest(v_learning_item_ids) AS item_id) learned
    ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
      purchase_count = base_list_item_store_stats.purchase_count + 1,
      last_purchased_at = EXCLUDED.last_purchased_at;
    PERFORM public.recompute_usual_store(v_learning_item_ids);
  END IF;

  RETURN QUERY SELECT new_count, updated_count, skipped_count, over_limit_count;
END;
$$;


-- Existing store merge contract extended to move scoped sessions and combine item statistics.
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
  v_affected_item_ids UUID[] := ARRAY[]::UUID[];
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

  PERFORM set_config('listys.learning', 'on', TRUE);

  SELECT COALESCE(array_agg(DISTINCT s.base_list_item_id), ARRAY[]::UUID[])
  INTO v_affected_item_ids
  FROM public.base_list_item_store_stats s
  WHERE s.store_id = p_source_id AND s.user_id = v_user_id;

  UPDATE public.shopping_sessions SET store_id = p_target_id
  WHERE user_id = v_user_id AND store_id = p_source_id;
  UPDATE public.tickets SET store_id = p_target_id WHERE user_id = v_user_id AND store_id = p_source_id;

  INSERT INTO public.base_list_item_store_stats (
    user_id, base_list_item_id, store_id, purchase_count, last_purchased_at, last_price, last_price_at
  )
  SELECT s.user_id, s.base_list_item_id, p_target_id, SUM(s.purchase_count)::INTEGER,
    MAX(s.last_purchased_at),
    (array_agg(s.last_price ORDER BY s.last_price_at DESC NULLS LAST))[1],
    MAX(s.last_price_at)
  FROM public.base_list_item_store_stats s
  WHERE s.user_id = v_user_id AND s.store_id = p_source_id
  GROUP BY s.user_id, s.base_list_item_id
  ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
    purchase_count = base_list_item_store_stats.purchase_count + EXCLUDED.purchase_count,
    last_purchased_at = GREATEST(base_list_item_store_stats.last_purchased_at, EXCLUDED.last_purchased_at),
    last_price = CASE
      WHEN EXCLUDED.last_price_at IS NOT NULL
        AND (base_list_item_store_stats.last_price_at IS NULL
          OR EXCLUDED.last_price_at > base_list_item_store_stats.last_price_at)
        THEN EXCLUDED.last_price
      ELSE base_list_item_store_stats.last_price
    END,
    last_price_at = GREATEST(base_list_item_store_stats.last_price_at, EXCLUDED.last_price_at);

  UPDATE public.base_list_items bli SET usual_store_id = p_target_id
  FROM public.base_lists bl
  WHERE bli.base_list_id = bl.id AND bl.user_id = v_user_id AND bli.usual_store_id = p_source_id;

  DELETE FROM public.base_list_item_store_stats
  WHERE user_id = v_user_id AND store_id = p_source_id;
  UPDATE public.store_aliases SET store_id = p_target_id WHERE user_id = v_user_id AND store_id = p_source_id;
  DELETE FROM public.stores WHERE id = p_source_id AND user_id = v_user_id;

  PERFORM public.recompute_usual_store(v_affected_item_ids);

  SELECT * INTO v_store FROM public.stores WHERE id = p_target_id;
  RETURN v_store;
END;
$$;
