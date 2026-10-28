-- Non-destructive review (Phase 5 / close-the-loop)
--
-- Review of every migration-time statement:
--   1. The prerequisite DO block reads the catalog and aborts if Phase 4 objects are missing.
--   2. ALTER TABLE tickets adds nullable total_amount with a nonnegative CHECK and nullable shopping_session_id.
--   3. CREATE UNIQUE INDEX adds the referenced (session id, owner) key; ALTER TABLE adds the composite FK whose only
--      delete action clears that nullable ticket link; another partial unique index limits each session to one receipt.
--   4. ALTER TABLE base_list_item_store_stats adds nullable last_quantity/last_unit; existing rows keep NULL values.
--   5. CREATE FUNCTION/TRIGGER adds the 48-hour constant and guarded link writer; CREATE OR REPLACE FUNCTION installs
--      owner-checked matches, candidates, completion/attach RPCs and replaces merge/completion bodies in place.
--   6. REVOKE/GRANT narrows completion-helper EXECUTE to authenticated callers (the helper still checks owner and locks).
-- There is no migration-time DELETE, UPDATE, TRUNCATE, backfill or DROP. Existing rows are not rewritten. The only new
-- ON DELETE action clears tickets.shopping_session_id when its owner deletes an already-deletable shopping session.
--
-- Required prerequisite: 20261027000000_store_tags_and_scoped_sessions.
DO $$
BEGIN
  IF to_regclass('public.base_list_item_store_stats') IS NULL
    OR to_regprocedure('public.recompute_usual_store(uuid[])') IS NULL
    OR to_regprocedure('public.start_shopping_session(uuid,text,uuid)') IS NULL
    OR to_regprocedure('public.complete_shopping_session(uuid,numeric,text,integer)') IS NULL
    OR to_regprocedure('public.merge_ticket_items_to_base_list(uuid,uuid,uuid[],integer,jsonb)') IS NULL
  THEN
    RAISE EXCEPTION 'close-the-loop requires the Phase 4 store-tags-and-scoped-sessions migration';
  END IF;
END;
$$;

ALTER TABLE public.tickets
  ADD COLUMN total_amount NUMERIC(12, 2) NULL CHECK (total_amount IS NULL OR total_amount >= 0),
  ADD COLUMN shopping_session_id UUID NULL;

CREATE UNIQUE INDEX uq_shopping_sessions_id_user_id
  ON public.shopping_sessions(id, user_id);

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_shopping_session_user_fkey
  FOREIGN KEY (shopping_session_id, user_id)
  REFERENCES public.shopping_sessions(id, user_id)
  ON DELETE SET NULL (shopping_session_id);

CREATE UNIQUE INDEX uq_tickets_shopping_session_id
  ON public.tickets(shopping_session_id)
  WHERE shopping_session_id IS NOT NULL;

ALTER TABLE public.base_list_item_store_stats
  ADD COLUMN last_quantity NUMERIC NULL,
  ADD COLUMN last_unit TEXT NULL;

CREATE OR REPLACE FUNCTION public.receipt_attach_window()
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$ SELECT INTERVAL '48 hours' $$;

CREATE OR REPLACE FUNCTION public.guard_ticket_shopping_session_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.shopping_session_id IS NOT DISTINCT FROM OLD.shopping_session_id THEN
    RETURN NEW;
  END IF;

  IF current_setting('listys.learning', TRUE) = 'on' THEN
    RETURN NEW;
  END IF;

  -- PostgreSQL's ON DELETE SET NULL action runs after the referenced row has disappeared.
  IF NEW.shopping_session_id IS NULL
    AND OLD.shopping_session_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.shopping_sessions WHERE id = OLD.shopping_session_id)
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Receipt session links can only be changed by the attach operation';
END;
$$;

CREATE TRIGGER guard_ticket_shopping_session_link
  BEFORE INSERT OR UPDATE OF shopping_session_id ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.guard_ticket_shopping_session_link();

CREATE OR REPLACE FUNCTION public.ticket_session_matches(p_ticket_id UUID, p_session_id UUID)
RETURNS TABLE(
  ticket_item_id UUID,
  match_kind TEXT,
  shopping_session_item_id UUID,
  shopping_session_item_name TEXT,
  checked BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE id = p_ticket_id AND user_id = v_user_id)
    OR NOT EXISTS (SELECT 1 FROM public.shopping_sessions WHERE id = p_session_id AND user_id = v_user_id)
  THEN RAISE EXCEPTION 'Ticket or shopping session not found' USING ERRCODE = 'P0002'; END IF;

  RETURN QUERY
  SELECT ti.id,
         CASE
           WHEN direct_item.id IS NOT NULL THEN 'name'
           WHEN alias_item.id IS NOT NULL THEN 'alias'
           ELSE 'none'
         END,
         COALESCE(direct_item.id, alias_item.id),
         COALESCE(direct_item.name, alias_item.name),
         COALESCE(direct_item.checked, alias_item.checked)
  FROM public.ticket_items ti
  LEFT JOIN LATERAL (
    SELECT ssi.id, ssi.name, ssi.checked
    FROM public.shopping_session_items ssi
    WHERE ssi.shopping_session_id = p_session_id
      AND ti.normalized_name IS NOT NULL
      AND ssi.normalized_name = ti.normalized_name
    ORDER BY ssi.sort_order, ssi.id
    LIMIT 1
  ) direct_item ON TRUE
  LEFT JOIN LATERAL (
    SELECT ssi.id, ssi.name, ssi.checked
    FROM public.base_list_item_aliases a
    JOIN public.base_list_items bli ON bli.id = a.base_list_item_id AND bli.base_list_id = (
      SELECT ss.base_list_id FROM public.shopping_sessions ss WHERE ss.id = p_session_id
    )
    JOIN public.shopping_session_items ssi
      ON ssi.shopping_session_id = p_session_id AND ssi.normalized_name = bli.normalized_name
    WHERE direct_item.id IS NULL
      AND ti.normalized_name IS NOT NULL
      AND a.base_list_id = (SELECT ss.base_list_id FROM public.shopping_sessions ss WHERE ss.id = p_session_id)
      AND a.alias_key = ti.normalized_name
    ORDER BY ssi.sort_order, ssi.id
    LIMIT 1
  ) alias_item ON TRUE
  WHERE ti.ticket_id = p_ticket_id
  ORDER BY ti.created_at, ti.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ticket_session_candidates(p_ticket_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  store_id UUID,
  store_name TEXT,
  base_list_id UUID,
  base_list_name TEXT,
  checked_count INTEGER,
  item_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_ticket_created_at TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT t.created_at INTO v_ticket_created_at
  FROM public.tickets t
  WHERE t.id = p_ticket_id AND t.user_id = v_user_id
    AND t.ocr_status = 'completed' AND t.shopping_session_id IS NULL AND t.base_list_id IS NULL;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT ss.id, ss.name, ss.status::TEXT, ss.started_at, ss.completed_at,
         ss.store_id, st.name,
         ss.base_list_id, bl.name,
         COUNT(*) FILTER (WHERE ssi.checked IS TRUE)::INTEGER,
         COUNT(ssi.id)::INTEGER
  FROM public.shopping_sessions ss
  JOIN public.base_lists bl ON bl.id = ss.base_list_id AND bl.user_id = v_user_id
  LEFT JOIN public.stores st ON st.id = ss.store_id AND st.user_id = v_user_id
  LEFT JOIN public.shopping_session_items ssi ON ssi.shopping_session_id = ss.id
  WHERE ss.user_id = v_user_id
    AND (ss.status = 'active' OR (ss.status = 'completed' AND ss.completed_at >= v_ticket_created_at - public.receipt_attach_window()))
    AND NOT EXISTS (SELECT 1 FROM public.tickets attached WHERE attached.shopping_session_id = ss.id)
  GROUP BY ss.id, st.name, bl.name
  ORDER BY CASE WHEN ss.status = 'active' THEN 0 ELSE 1 END,
           CASE WHEN ss.status = 'active' THEN ss.started_at END DESC,
           CASE WHEN ss.status = 'completed' THEN ss.completed_at END DESC,
           ss.id
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_session_completion(p_session_id UUID, p_max_items INTEGER)
RETURNS TABLE(
  new_count INTEGER,
  updated_count INTEGER,
  skipped_count INTEGER,
  over_limit_count INTEGER,
  touched_item_ids UUID[]
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_base_list_id UUID;
  v_status TEXT;
  v_current_count INTEGER;
  v_capacity INTEGER;
  v_existing public.base_list_items%ROWTYPE;
  v_sort_order INTEGER;
  v_store_id UUID;
  v_item_id UUID;
  v_learning_item_ids UUID[] := ARRAY[]::UUID[];
  rec RECORD;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT ss.base_list_id, ss.status::TEXT, ss.store_id
  INTO v_base_list_id, v_status, v_store_id
  FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id AND ss.user_id = v_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SESSION_NOT_FOUND'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'SESSION_NOT_ACTIVE'; END IF;

  PERFORM 1 FROM public.base_lists WHERE id = v_base_list_id FOR UPDATE;
  UPDATE public.shopping_sessions
  SET status = 'completed', completed_at = NOW(), sync_to_base = TRUE, updated_at = NOW()
  WHERE id = p_session_id AND user_id = v_user_id;

  SELECT COUNT(*) INTO v_current_count FROM public.base_list_items WHERE base_list_id = v_base_list_id;
  v_capacity := GREATEST(COALESCE(p_max_items, 250) - v_current_count, 0);
  new_count := 0;
  updated_count := 0;
  over_limit_count := 0;

  SELECT COUNT(*)::INTEGER INTO skipped_count
  FROM public.shopping_session_items ssi
  WHERE ssi.shopping_session_id = p_session_id
    AND ssi.checked IS TRUE
    AND COALESCE(ssi.normalized_name, '') = '';

  FOR rec IN
    SELECT d.* FROM (
      SELECT DISTINCT ON (ssi.normalized_name) ssi.*
      FROM public.shopping_session_items ssi
      WHERE ssi.shopping_session_id = p_session_id
        AND ssi.checked IS TRUE
        AND ssi.normalized_name IS NOT NULL
        AND ssi.normalized_name <> ''
      ORDER BY ssi.normalized_name, ssi.sort_order, ssi.id
    ) d
    ORDER BY d.sort_order, d.id
  LOOP
    SELECT * INTO v_existing
    FROM public.base_list_items bli
    WHERE bli.base_list_id = v_base_list_id AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.base_list_items
      SET quantity = rec.quantity, unit = rec.unit, notes = rec.notes, category = rec.category,
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
      v_item_id := v_existing.id;
      updated_count := updated_count + 1;
    ELSIF v_capacity > 0 THEN
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items WHERE base_list_id = v_base_list_id;
      INSERT INTO public.base_list_items (
        base_list_id, name, quantity, unit, notes, category, sort_order, normalized_name,
        purchase_count, first_seen_at, last_purchased_at, average_price
      ) VALUES (
        v_base_list_id, rec.name, COALESCE(rec.quantity, 1), rec.unit, rec.notes, rec.category,
        v_sort_order, rec.normalized_name, 1, NOW(), NOW(), rec.price
      ) RETURNING id INTO v_item_id;
      v_capacity := v_capacity - 1;
      new_count := new_count + 1;
    ELSE
      skipped_count := skipped_count + 1;
      over_limit_count := over_limit_count + 1;
      CONTINUE;
    END IF;

    IF NOT (v_item_id = ANY(v_learning_item_ids)) THEN
      v_learning_item_ids := array_append(v_learning_item_ids, v_item_id);
    END IF;
  END LOOP;

  IF v_store_id IS NOT NULL AND cardinality(v_learning_item_ids) > 0 THEN
    PERFORM set_config('listys.learning', 'on', TRUE);
    INSERT INTO public.base_list_item_store_stats (
      user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
      last_price, last_price_at, last_quantity, last_unit
    )
    SELECT v_user_id, learned.item_id, v_store_id, 1, NOW(), ssi.price,
           CASE WHEN ssi.price IS NULL THEN NULL ELSE NOW() END, ssi.quantity, ssi.unit
    FROM unnest(v_learning_item_ids) learned(item_id)
    JOIN public.base_list_items bli ON bli.id = learned.item_id
    LEFT JOIN LATERAL (
      SELECT item.price, item.quantity, item.unit
      FROM public.shopping_session_items item
      WHERE item.shopping_session_id = p_session_id
        AND item.checked IS TRUE AND item.normalized_name = bli.normalized_name
      ORDER BY item.sort_order, item.id LIMIT 1
    ) ssi ON TRUE
    ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
      purchase_count = base_list_item_store_stats.purchase_count + 1,
      last_purchased_at = EXCLUDED.last_purchased_at,
      last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
      last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
      last_quantity = COALESCE(EXCLUDED.last_quantity, base_list_item_store_stats.last_quantity),
      last_unit = COALESCE(EXCLUDED.last_unit, base_list_item_store_stats.last_unit);
    PERFORM public.recompute_usual_store(v_learning_item_ids);
  END IF;

  touched_item_ids := v_learning_item_ids;
  RETURN NEXT;
END;
$$;

-- An invoker wrapper cannot call a helper revoked from its invoking role. Authenticated callers are allowed here;
-- the helper repeats ownership/status checks and locks the session, so a direct RPC has the same authority as completion.
REVOKE EXECUTE ON FUNCTION public.apply_session_completion(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_session_completion(UUID, INTEGER) TO authenticated;

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
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  PERFORM 1 FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id AND ss.user_id = v_user_id AND ss.status = 'active'
  FOR UPDATE;
  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.shopping_sessions WHERE id = p_session_id AND user_id = v_user_id)
      THEN RAISE EXCEPTION 'SESSION_NOT_ACTIVE';
      ELSE RAISE EXCEPTION 'SESSION_NOT_FOUND';
    END IF;
  END IF;

  UPDATE public.shopping_sessions
  SET total_amount = COALESCE(p_total_amount, total_amount),
      general_notes = COALESCE(p_general_notes, general_notes), updated_at = NOW()
  WHERE id = p_session_id AND user_id = v_user_id;

  RETURN QUERY
  SELECT core.new_count, core.updated_count, core.skipped_count, core.over_limit_count
  FROM public.apply_session_completion(p_session_id, p_max_items) core;
END;
$$;

CREATE OR REPLACE FUNCTION public.attach_receipt_to_session(
  p_ticket_id UUID,
  p_session_id UUID,
  p_links JSONB DEFAULT '[]'::JSONB,
  p_added_item_ids UUID[] DEFAULT ARRAY[]::UUID[],
  p_total_amount NUMERIC DEFAULT NULL,
  p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(
  completed_now BOOLEAN,
  matched_count INTEGER,
  checked_now_count INTEGER,
  added_count INTEGER,
  priced_count INTEGER,
  over_limit_count INTEGER,
  replayed BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_ticket public.tickets%ROWTYPE;
  v_session public.shopping_sessions%ROWTYPE;
  v_ticket_item public.ticket_items%ROWTYPE;
  v_match RECORD;
  v_target_id UUID;
  v_link_target UUID;
  v_line_is_linked BOOLEAN;
  v_existing_checked BOOLEAN;
  v_store_id UUID;
  v_original_store_id UUID;
  v_current_count INTEGER;
  v_sort_order INTEGER;
  v_base_item_id UUID;
  v_item_ids UUID[] := ARRAY[]::UUID[];
  v_receipt_target_ids UUID[] := ARRAY[]::UUID[];
  v_added_base_item_ids UUID[] := ARRAY[]::UUID[];
  v_core RECORD;
  v_invalid INTEGER;
  v_replayed BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_links IS NULL OR jsonb_typeof(p_links) <> 'array' THEN
    RAISE EXCEPTION 'Invalid receipt links' USING ERRCODE = '22023';
  END IF;
  IF p_added_item_ids IS NULL THEN p_added_item_ids := ARRAY[]::UUID[]; END IF;
  IF array_position(p_added_item_ids, NULL) IS NOT NULL
    OR (SELECT COUNT(DISTINCT item_id) FROM unnest(p_added_item_ids) item_id) <> cardinality(p_added_item_ids)
  THEN RAISE EXCEPTION 'Added receipt lines must be distinct' USING ERRCODE = '22023'; END IF;
  IF p_total_amount IS NOT NULL AND p_total_amount < 0 THEN
    RAISE EXCEPTION 'Receipt total must be zero or greater' USING ERRCODE = '22023';
  END IF;

  -- Always lock receipt before session, matching the merge lock order.
  SELECT * INTO v_ticket FROM public.tickets t
  WHERE t.id = p_ticket_id AND t.user_id = v_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002'; END IF;

  IF v_ticket.shopping_session_id = p_session_id THEN
    v_replayed := TRUE;
    RETURN QUERY SELECT FALSE, 0, 0, 0, 0, 0, TRUE;
    RETURN;
  ELSIF v_ticket.shopping_session_id IS NOT NULL THEN
    RAISE EXCEPTION 'Receipt is already attached to another trip'
      USING ERRCODE = '23505', DETAIL = 'RECEIPT_ATTACHED';
  END IF;

  SELECT * INTO v_session FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id AND ss.user_id = v_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Shopping session not found' USING ERRCODE = 'P0002'; END IF;

  IF EXISTS (SELECT 1 FROM public.tickets t WHERE t.shopping_session_id = p_session_id AND t.id <> p_ticket_id) THEN
    RAISE EXCEPTION 'This trip already has a receipt'
      USING ERRCODE = '23505', DETAIL = 'SESSION_HAS_RECEIPT';
  END IF;
  IF v_ticket.ocr_status <> 'completed' THEN
    RAISE EXCEPTION 'RECEIPT_NOT_READ' USING ERRCODE = 'P0001';
  END IF;
  IF v_ticket.base_list_id IS NOT NULL THEN
    RAISE EXCEPTION 'RECEIPT_ADDED_TO_LIST' USING ERRCODE = 'P0001';
  END IF;
  IF v_session.status <> 'active' AND NOT (
    v_session.status = 'completed'
    AND v_session.completed_at >= v_ticket.created_at - public.receipt_attach_window()
  ) THEN RAISE EXCEPTION 'SESSION_OUT_OF_WINDOW' USING ERRCODE = 'P0001'; END IF;

  IF v_session.status = 'completed' AND v_session.store_id IS NOT NULL
    AND v_ticket.store_id IS NOT NULL AND v_session.store_id <> v_ticket.store_id
  THEN RAISE EXCEPTION 'STORE_MISMATCH' USING ERRCODE = 'P0001'; END IF;
  v_original_store_id := v_session.store_id;
  v_store_id := COALESCE(v_session.store_id, v_ticket.store_id);
  IF v_session.status = 'active' AND v_ticket.store_id IS NOT NULL THEN
    v_store_id := v_ticket.store_id;
  END IF;

  -- Validate every selected line and target before changing a row.
  IF jsonb_array_length(p_links) > 200 THEN RAISE EXCEPTION 'Too many receipt links' USING ERRCODE = '22023'; END IF;
  SELECT COUNT(*) INTO v_invalid
  FROM jsonb_array_elements(p_links) link
  WHERE NOT (link ? 'ticket_item_id' AND link ? 'shopping_session_item_id');
  IF v_invalid > 0 THEN RAISE EXCEPTION 'Invalid receipt link shape' USING ERRCODE = '22023'; END IF;

  SELECT COUNT(*) INTO v_invalid
  FROM (
    SELECT link.value ->> 'ticket_item_id' AS id
    FROM jsonb_array_elements(p_links) link
  ) links
  WHERE links.id IS NULL OR links.id !~* '^[0-9a-f-]{36}$';
  IF v_invalid > 0 THEN RAISE EXCEPTION 'Invalid receipt line id' USING ERRCODE = '22023'; END IF;

  SELECT COUNT(*) INTO v_invalid
  FROM jsonb_array_elements(p_links) link
  WHERE link.value ->> 'shopping_session_item_id' IS NOT NULL
    AND (link.value ->> 'shopping_session_item_id') !~* '^[0-9a-f-]{36}$';
  IF v_invalid > 0 THEN RAISE EXCEPTION 'Invalid trip item id' USING ERRCODE = '22023'; END IF;

  IF (SELECT COUNT(DISTINCT link.value ->> 'ticket_item_id') FROM jsonb_array_elements(p_links) link) <> jsonb_array_length(p_links)
  THEN RAISE EXCEPTION 'Receipt link lines must be distinct' USING ERRCODE = '22023'; END IF;

  SELECT COUNT(*) INTO v_invalid
  FROM jsonb_array_elements(p_links) link
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ticket_items ti
    WHERE ti.id = (link.value ->> 'ticket_item_id')::UUID AND ti.ticket_id = p_ticket_id
  )
  OR COALESCE(link.value ->> 'shopping_session_item_id', '') <> ''
    AND NOT EXISTS (
      SELECT 1 FROM public.shopping_session_items ssi
      WHERE ssi.id = (link.value ->> 'shopping_session_item_id')::UUID
        AND ssi.shopping_session_id = p_session_id
    );
  IF v_invalid > 0 THEN RAISE EXCEPTION 'Receipt link is outside this receipt or trip' USING ERRCODE = '22023'; END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_added_item_ids) added(id)
    JOIN jsonb_array_elements(p_links) link ON (link.value ->> 'ticket_item_id')::UUID = added.id
  ) THEN RAISE EXCEPTION 'A receipt line cannot be linked and added' USING ERRCODE = '22023'; END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(p_added_item_ids) added(id)
    WHERE NOT EXISTS (SELECT 1 FROM public.ticket_items ti WHERE ti.id = added.id AND ti.ticket_id = p_ticket_id)
  ) THEN RAISE EXCEPTION 'Added line is outside this receipt' USING ERRCODE = '22023'; END IF;

  -- The receipt link is still guarded. Internal learning mode is transaction-local and reset automatically.
  PERFORM set_config('listys.learning', 'on', TRUE);
  PERFORM 1 FROM public.base_lists WHERE id = v_session.base_list_id AND user_id = v_user_id FOR UPDATE;
  IF v_session.store_id IS DISTINCT FROM v_store_id THEN
    UPDATE public.shopping_sessions SET store_id = v_store_id, updated_at = NOW() WHERE id = p_session_id;
  END IF;
  UPDATE public.shopping_sessions
  SET total_amount = COALESCE(p_total_amount, total_amount), updated_at = NOW()
  WHERE id = p_session_id;

  -- Clear prices for matched rows once; receipt lines below rebuild the total for each matched session item.
  FOR v_ticket_item IN SELECT ti.* FROM public.ticket_items ti WHERE ti.ticket_id = p_ticket_id ORDER BY ti.created_at, ti.id LOOP
    SELECT m.match_kind, m.shopping_session_item_id INTO v_match
    FROM public.ticket_session_matches(p_ticket_id, p_session_id) m
    WHERE m.ticket_item_id = v_ticket_item.id;
    v_target_id := NULL;
    v_line_is_linked := FALSE;

    SELECT (link.value ->> 'shopping_session_item_id')::UUID INTO v_link_target
    FROM jsonb_array_elements(p_links) link
    WHERE (link.value ->> 'ticket_item_id')::UUID = v_ticket_item.id;
    IF FOUND THEN
      v_line_is_linked := TRUE;
      IF v_link_target IS NOT NULL THEN
        IF v_match.match_kind = 'name' AND v_match.shopping_session_item_id <> v_link_target THEN
          RAISE EXCEPTION 'A name match cannot be linked to a different trip item' USING ERRCODE = '22023';
        END IF;
        v_target_id := v_link_target;
      END IF;
    ELSIF v_match.match_kind <> 'none' THEN
      v_target_id := v_match.shopping_session_item_id;
    END IF;

    IF v_target_id IS NOT NULL THEN
      SELECT ssi.checked INTO v_existing_checked FROM public.shopping_session_items ssi
      WHERE ssi.id = v_target_id AND ssi.shopping_session_id = p_session_id FOR UPDATE;
      IF v_existing_checked IS NOT TRUE THEN checked_now_count := COALESCE(checked_now_count, 0) + 1; END IF;
      IF NOT (v_target_id = ANY(v_item_ids)) THEN
        v_item_ids := array_append(v_item_ids, v_target_id);
        UPDATE public.shopping_session_items SET checked = TRUE, price = NULL, updated_at = NOW() WHERE id = v_target_id;
      END IF;
      IF NOT (v_target_id = ANY(v_receipt_target_ids)) THEN
        v_receipt_target_ids := array_append(v_receipt_target_ids, v_target_id);
      END IF;
      IF v_ticket_item.price IS NOT NULL THEN
        UPDATE public.shopping_session_items
        SET price = COALESCE(price, 0) + v_ticket_item.price, updated_at = NOW()
        WHERE id = v_target_id;
        priced_count := COALESCE(priced_count, 0) + 1;
      END IF;
      matched_count := COALESCE(matched_count, 0) + 1;

      IF v_line_is_linked AND v_ticket_item.normalized_name IS NOT NULL AND v_ticket_item.normalized_name <> '' THEN
        SELECT bli.id INTO v_base_item_id
        FROM public.base_list_items bli
        JOIN public.shopping_session_items ssi ON ssi.id = v_target_id
        WHERE bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name;
        IF v_base_item_id IS NOT NULL THEN
          INSERT INTO public.base_list_item_aliases(base_list_id, base_list_item_id, alias_key)
          VALUES (v_session.base_list_id, v_base_item_id, v_ticket_item.normalized_name)
          ON CONFLICT (base_list_id, alias_key) DO UPDATE
          SET base_list_item_id = EXCLUDED.base_list_item_id
          WHERE base_list_item_aliases.base_list_item_id <> EXCLUDED.base_list_item_id;
        END IF;
      END IF;
    ELSIF v_ticket_item.id = ANY(p_added_item_ids) THEN
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.shopping_session_items WHERE shopping_session_id = p_session_id;
      INSERT INTO public.shopping_session_items (
        shopping_session_id, name, normalized_name, quantity, unit, category, checked, price, sort_order
      ) VALUES (
        p_session_id, v_ticket_item.name, v_ticket_item.normalized_name,
        COALESCE(v_ticket_item.quantity, 1), v_ticket_item.unit, v_ticket_item.category,
        TRUE, v_ticket_item.price, v_sort_order
      ) RETURNING id INTO v_target_id;
      v_item_ids := array_append(v_item_ids, v_target_id);
      added_count := COALESCE(added_count, 0) + 1;
      IF v_ticket_item.price IS NOT NULL THEN priced_count := COALESCE(priced_count, 0) + 1; END IF;
    END IF;
  END LOOP;

  IF v_session.status = 'active' THEN
    SELECT * INTO v_core FROM public.apply_session_completion(p_session_id, p_max_items);
    completed_now := TRUE;
    over_limit_count := v_core.over_limit_count;
  ELSE
    completed_now := FALSE;
    -- Existing purchases were already counted. A newly attached line is a new purchase; a matched line only adds its receipt price.
    SELECT COUNT(*) INTO v_current_count FROM public.base_list_items WHERE base_list_id = v_session.base_list_id;
    FOR v_ticket_item IN
      SELECT ti.* FROM public.ticket_items ti WHERE ti.ticket_id = p_ticket_id AND ti.id = ANY(p_added_item_ids)
      ORDER BY ti.created_at, ti.id
    LOOP
      IF COALESCE(v_ticket_item.normalized_name, '') = '' THEN
        over_limit_count := COALESCE(over_limit_count, 0) + 1;
        CONTINUE;
      END IF;
      SELECT bli.id INTO v_base_item_id FROM public.base_list_items bli
      WHERE bli.base_list_id = v_session.base_list_id AND bli.normalized_name = v_ticket_item.normalized_name FOR UPDATE;
      IF FOUND THEN
        UPDATE public.base_list_items
        SET quantity = COALESCE(v_ticket_item.quantity, 1), unit = v_ticket_item.unit,
            purchase_count = COALESCE(purchase_count, 0) + 1, last_purchased_at = NOW(),
            average_price = CASE WHEN v_ticket_item.price IS NULL THEN average_price
              WHEN average_price IS NULL THEN v_ticket_item.price
              ELSE ((average_price * GREATEST(COALESCE(purchase_count, 0), 0)) + v_ticket_item.price)
                / (GREATEST(COALESCE(purchase_count, 0), 0) + 1) END,
            updated_at = NOW()
        WHERE id = v_base_item_id;
      ELSIF v_current_count < COALESCE(p_max_items, 250) THEN
        SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order FROM public.base_list_items WHERE base_list_id = v_session.base_list_id;
        INSERT INTO public.base_list_items (
          base_list_id, name, quantity, unit, category, sort_order, normalized_name,
          purchase_count, first_seen_at, last_purchased_at, average_price
        ) VALUES (
          v_session.base_list_id, v_ticket_item.name, COALESCE(v_ticket_item.quantity, 1), v_ticket_item.unit,
          v_ticket_item.category, v_sort_order, v_ticket_item.normalized_name, 1, NOW(), NOW(), v_ticket_item.price
        ) RETURNING id INTO v_base_item_id;
        v_current_count := v_current_count + 1;
      ELSE
        over_limit_count := COALESCE(over_limit_count, 0) + 1;
        CONTINUE;
      END IF;
      v_added_base_item_ids := array_append(v_added_base_item_ids, v_base_item_id);
      IF v_store_id IS NOT NULL THEN
        INSERT INTO public.base_list_item_store_stats (
          user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
          last_price, last_price_at, last_quantity, last_unit
        ) VALUES (
          v_user_id, v_base_item_id, v_store_id, 1, NOW(), v_ticket_item.price,
          CASE WHEN v_ticket_item.price IS NULL THEN NULL ELSE NOW() END,
          v_ticket_item.quantity, v_ticket_item.unit
        )
        ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
          purchase_count = base_list_item_store_stats.purchase_count + 1,
          last_purchased_at = NOW(),
          last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
          last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
          last_quantity = COALESCE(EXCLUDED.last_quantity, base_list_item_store_stats.last_quantity),
          last_unit = COALESCE(EXCLUDED.last_unit, base_list_item_store_stats.last_unit);
      END IF;
    END LOOP;

    -- The session had no store when it was completed. Its earlier purchases were not learned by store yet.
    IF v_original_store_id IS NULL AND v_store_id IS NOT NULL THEN
      INSERT INTO public.base_list_item_store_stats (
        user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
        last_price, last_price_at, last_quantity, last_unit
      )
      SELECT v_user_id, bli.id, v_store_id, 1, NOW(), ssi.price,
             CASE WHEN ssi.price IS NULL THEN NULL ELSE NOW() END, ssi.quantity, ssi.unit
      FROM (
        SELECT DISTINCT ON (ssi.normalized_name) ssi.*
        FROM public.shopping_session_items ssi
        WHERE ssi.shopping_session_id = p_session_id AND ssi.checked IS TRUE
          AND COALESCE(ssi.normalized_name, '') <> ''
        ORDER BY ssi.normalized_name, ssi.sort_order, ssi.id
      ) ssi
      JOIN public.base_list_items bli
        ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
      WHERE NOT (bli.id = ANY(v_added_base_item_ids))
      ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
        purchase_count = base_list_item_store_stats.purchase_count + 1,
        last_purchased_at = NOW(),
        last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
        last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
        last_quantity = COALESCE(EXCLUDED.last_quantity, base_list_item_store_stats.last_quantity),
        last_unit = COALESCE(EXCLUDED.last_unit, base_list_item_store_stats.last_unit);
    END IF;

    -- Receipt prices refine a purchase already counted when the session was completed.
    UPDATE public.base_list_items bli
    SET average_price = CASE
      WHEN ssi.price IS NULL THEN bli.average_price
      WHEN bli.average_price IS NULL OR COALESCE(bli.purchase_count, 0) <= 0 THEN ssi.price
      ELSE ((bli.average_price * (bli.purchase_count - 1)) + ssi.price) / bli.purchase_count
      END,
      updated_at = NOW()
    FROM public.shopping_session_items ssi
    WHERE ssi.id = ANY(v_item_ids) AND ssi.normalized_name = bli.normalized_name
      AND bli.base_list_id = v_session.base_list_id;

    IF v_store_id IS NOT NULL THEN
      UPDATE public.base_list_item_store_stats stats
      SET last_price = ssi.price, last_price_at = CASE WHEN ssi.price IS NULL THEN stats.last_price_at ELSE NOW() END,
          last_quantity = ssi.quantity, last_unit = ssi.unit
      FROM public.shopping_session_items ssi
      JOIN public.base_list_items bli ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
      WHERE ssi.id = ANY(v_item_ids) AND stats.base_list_item_id = bli.id AND stats.store_id = v_store_id;
    END IF;

    IF v_original_store_id IS NULL AND v_store_id IS NOT NULL THEN
      PERFORM public.recompute_usual_store(ARRAY(
        SELECT DISTINCT bli.id
        FROM public.shopping_session_items ssi
        JOIN public.base_list_items bli
          ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
        WHERE ssi.shopping_session_id = p_session_id AND ssi.checked IS TRUE
      ));
    ELSE
      PERFORM public.recompute_usual_store(v_added_base_item_ids);
    END IF;
  END IF;

  -- Store stats describe the quantity on the receipt when one item was split across multiple receipt lines.
  IF v_store_id IS NOT NULL AND cardinality(v_receipt_target_ids) > 0 THEN
    WITH line_totals AS (
      SELECT target.id AS shopping_session_item_id,
             SUM(COALESCE(ti.quantity, 1)) AS quantity,
             CASE WHEN COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) = 1
               THEN MIN(ti.unit) ELSE NULL END AS unit,
             SUM(ti.price) FILTER (WHERE ti.price IS NOT NULL) AS price
      FROM public.ticket_items ti
      JOIN public.ticket_session_matches(p_ticket_id, p_session_id) m ON m.ticket_item_id = ti.id
      LEFT JOIN LATERAL (
        SELECT (link.value ->> 'shopping_session_item_id')::UUID AS id,
               TRUE AS explicitly_linked
        FROM jsonb_array_elements(p_links) link
        WHERE (link.value ->> 'ticket_item_id')::UUID = ti.id
      ) explicit_target ON TRUE
      CROSS JOIN LATERAL (
        SELECT CASE
          WHEN explicit_target.explicitly_linked THEN explicit_target.id
          WHEN m.match_kind <> 'none' THEN m.shopping_session_item_id
          ELSE NULL
        END AS id
      ) target
      WHERE ti.ticket_id = p_ticket_id
        AND target.id = ANY(v_receipt_target_ids)
      GROUP BY target.id
    )
    UPDATE public.base_list_item_store_stats stats
    SET last_price = COALESCE(line_totals.price, stats.last_price),
        last_price_at = CASE WHEN line_totals.price IS NULL THEN stats.last_price_at ELSE NOW() END,
        last_quantity = line_totals.quantity,
        last_unit = line_totals.unit
    FROM line_totals
    JOIN public.shopping_session_items ssi ON ssi.id = line_totals.shopping_session_item_id
    JOIN public.base_list_items bli
      ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
    WHERE stats.base_list_item_id = bli.id AND stats.store_id = v_store_id;
  END IF;

  UPDATE public.tickets SET shopping_session_id = p_session_id, base_list_id = v_session.base_list_id,
    store_id = COALESCE(store_id, v_store_id)
  WHERE id = p_ticket_id AND user_id = v_user_id;

  matched_count := COALESCE(matched_count, 0);
  checked_now_count := COALESCE(checked_now_count, 0);
  added_count := COALESCE(added_count, 0);
  priced_count := COALESCE(priced_count, 0);
  over_limit_count := COALESCE(over_limit_count, 0);
  replayed := v_replayed;
  RETURN NEXT;
END;
$$;



-- The existing receipt merge behavior is preserved, with attached receipts rejected and last quantity/unit recorded.
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
  v_line_quantity NUMERIC;
  v_line_unit TEXT;
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

  IF EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = p_ticket_id AND t.shopping_session_id IS NOT NULL) THEN
    RAISE EXCEPTION 'RECEIPT_ATTACHED' USING ERRCODE = 'P0001';
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
        v_learning_prices := v_learning_prices || jsonb_build_object(v_target_id::TEXT, COALESCE((v_learning_prices ->> v_target_id::TEXT)::NUMERIC, 0) + v_price);
      END IF;
    END IF;
  END LOOP;

  IF v_store_id IS NOT NULL AND cardinality(v_learning_item_ids) > 0 THEN
    PERFORM set_config('listys.learning', 'on', TRUE);
    FOREACH v_item_id IN ARRAY v_learning_item_ids LOOP
      v_line_price := NULLIF(v_learning_prices ->> v_item_id::TEXT, '')::NUMERIC;
      SELECT SUM(COALESCE(ti.quantity, 1)),
        CASE WHEN COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) = 1
          THEN MIN(ti.unit) ELSE NULL END
      INTO v_line_quantity, v_line_unit
      FROM public.ticket_items ti
      JOIN public.base_list_items bli ON bli.normalized_name = ti.normalized_name AND bli.id = v_item_id
      WHERE ti.ticket_id = p_ticket_id
        AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids));

      INSERT INTO public.base_list_item_store_stats (
        user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
        last_price, last_price_at, last_quantity, last_unit
      ) VALUES (
        v_user_id, v_item_id, v_store_id, 1, NOW(), v_line_price,
        CASE WHEN v_line_price IS NULL THEN NULL ELSE NOW() END, v_line_quantity, v_line_unit
      )
      ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
        purchase_count = base_list_item_store_stats.purchase_count + 1,
        last_purchased_at = EXCLUDED.last_purchased_at,
        last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
        last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
        last_quantity = COALESCE(EXCLUDED.last_quantity, base_list_item_store_stats.last_quantity),
        last_unit = COALESCE(EXCLUDED.last_unit, base_list_item_store_stats.last_unit);
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
