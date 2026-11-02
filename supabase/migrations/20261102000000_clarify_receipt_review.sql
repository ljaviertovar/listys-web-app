-- =============================================
-- MIGRATION: clarify-receipt-review — upload origin, kept quantities, origin-only trip candidates
-- DATE: 2026-11-02
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
--   1. DO block: reads the catalog and aborts if the close-the-loop objects are missing. It writes nothing.
--   2. ALTER TABLE public.tickets ADD COLUMN uploaded_from_session_id ... NULL
--        Adds a nullable column. Existing rows receive NULL; no row is rewritten or backfilled.
--   3. ALTER TABLE ... ADD CONSTRAINT tickets_uploaded_from_session_user_fkey
--        Composite FK (session, owner) → shopping_sessions. Every existing value is NULL, so nothing can violate it.
--        Its only delete action clears the new nullable column when the owner deletes the session; the receipt stays.
--   4. CREATE INDEX idx_tickets_uploaded_from_session_id ... WHERE uploaded_from_session_id IS NOT NULL
--        Partial index so that clearing the link on session delete does not scan tickets.
--   5. CREATE OR REPLACE FUNCTION public.merge_ticket_items_to_base_list
--        Same signature and body as 20261028000000_close_the_loop; the single change is that an item that is updated keeps
--        its quantity (the line's quantity only fills a missing one) instead of adding the line's quantity to it.
--   6. CREATE OR REPLACE FUNCTION public.ticket_session_candidates
--        Same signature and body; the single change is that only the trip the receipt was uploaded from is returned.
--
-- There is no migration-time DELETE, UPDATE, TRUNCATE, DROP or backfill. Receipts uploaded before this migration have no
-- origin and simply stop offering a trip.
--
-- Rollback: re-run the two CREATE OR REPLACE statements from 20261028000000_close_the_loop.sql; the new column can stay unused.
-- Required prerequisite: 20261028000000_close_the_loop.
-- =============================================
DO $$
BEGIN
  IF to_regprocedure('public.merge_ticket_items_to_base_list(uuid,uuid,uuid[],integer,jsonb)') IS NULL
    OR to_regprocedure('public.ticket_session_candidates(uuid)') IS NULL
    OR to_regclass('public.uq_shopping_sessions_id_user_id') IS NULL
  THEN
    RAISE EXCEPTION 'clarify-receipt-review requires the close-the-loop migration';
  END IF;
END;
$$;

ALTER TABLE public.tickets
  ADD COLUMN uploaded_from_session_id UUID NULL;

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_uploaded_from_session_user_fkey
  FOREIGN KEY (uploaded_from_session_id, user_id)
  REFERENCES public.shopping_sessions(id, user_id)
  ON DELETE SET NULL (uploaded_from_session_id);

CREATE INDEX idx_tickets_uploaded_from_session_id
  ON public.tickets(uploaded_from_session_id)
  WHERE uploaded_from_session_id IS NOT NULL;

-- Receipt lines update an existing item's purchases and price, not the quantity the user usually buys.
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
        quantity = COALESCE(base_list_items.quantity, rec.quantity, 1),
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
  v_origin_session_id UUID;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT t.created_at, t.uploaded_from_session_id INTO v_ticket_created_at, v_origin_session_id
  FROM public.tickets t
  WHERE t.id = p_ticket_id AND t.user_id = v_user_id
    AND t.ocr_status = 'completed' AND t.shopping_session_id IS NULL AND t.base_list_id IS NULL;
  -- A receipt can only be attached to the trip it was uploaded from; without one there is nothing to offer.
  IF NOT FOUND OR v_origin_session_id IS NULL THEN RETURN; END IF;

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
    AND ss.id = v_origin_session_id
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
