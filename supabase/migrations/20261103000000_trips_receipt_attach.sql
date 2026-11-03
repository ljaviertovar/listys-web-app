-- =============================================
-- MIGRATION: trips-and-receipt-attach — no attach window, purchased quantity replaces the usual one
-- DATE: 2026-11-03
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
--   1. DO block: reads the catalog and aborts if the clarify-receipt-review objects are missing. It writes nothing.
--   2. CREATE OR REPLACE FUNCTION public.ticket_session_candidates
--        Same signature and body as 20261102000000_clarify_receipt_review; the single change is that the origin trip is a
--        candidate whenever it is active or completed (no 48-hour window). The unused upload-time variable goes with it.
--   3. CREATE OR REPLACE FUNCTION public.attach_receipt_to_session
--        Same signature and body as 20261028000000_close_the_loop with two changes: the SESSION_OUT_OF_WINDOW check is
--        removed (the session enum only has active/completed), and, after the receipt lines are matched, each matched
--        trip item takes the quantity bought (sum of its lines, same unit only). A completed trip also updates the
--        matching list item; an active trip hands it to the list through the unchanged completion step.
--
-- There is no migration-time DELETE, UPDATE, TRUNCATE, DROP or backfill: the UPDATE statements live inside the function
-- body and run only when a user attaches a receipt. public.receipt_attach_window() stays in place, unused.
--
-- Rollback: re-run the ticket_session_candidates CREATE OR REPLACE from 20261102000000_clarify_receipt_review.sql and the
-- attach_receipt_to_session CREATE OR REPLACE from 20261028000000_close_the_loop.sql. Quantities already replaced stay as
-- written; they are ordinary item edits.
-- Required prerequisite: 20261102000000_clarify_receipt_review.
-- =============================================
DO $$
BEGIN
  IF to_regprocedure('public.ticket_session_candidates(uuid)') IS NULL
    OR to_regprocedure('public.attach_receipt_to_session(uuid,uuid,jsonb,uuid[],numeric,integer)') IS NULL
    OR to_regclass('public.idx_tickets_uploaded_from_session_id') IS NULL
  THEN
    RAISE EXCEPTION 'trips-and-receipt-attach requires the clarify-receipt-review migration';
  END IF;
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
  v_origin_session_id UUID;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT t.uploaded_from_session_id INTO v_origin_session_id
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
    AND ss.status IN ('active', 'completed')
    AND NOT EXISTS (SELECT 1 FROM public.tickets attached WHERE attached.shopping_session_id = ss.id)
  GROUP BY ss.id, st.name, bl.name
  ORDER BY CASE WHEN ss.status = 'active' THEN 0 ELSE 1 END,
           CASE WHEN ss.status = 'active' THEN ss.started_at END DESC,
           CASE WHEN ss.status = 'completed' THEN ss.completed_at END DESC,
           ss.id
  LIMIT 20;
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
  v_qty RECORD;
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
  -- A completed trip takes a receipt however long ago it was completed: the receipt only adds prices, the total and quantities.

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

  -- The quantity bought replaces the planned/usual one (never added to it). Only matched items change: lines added as
  -- purchased already carry their own quantity, and checked items no line covers keep theirs. Lines of mixed units are
  -- ambiguous to add up, so those items keep quantity and unit; a line without a unit leaves the item's unit alone.
  FOR v_qty IN
    WITH line_totals AS (
      SELECT target.id AS shopping_session_item_id,
             SUM(COALESCE(ti.quantity, 1)) AS quantity,
             MIN(ti.unit) AS unit,
             COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) AS unit_kinds
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
    SELECT * FROM line_totals WHERE unit_kinds = 1
  LOOP
    UPDATE public.shopping_session_items
    SET quantity = v_qty.quantity, unit = COALESCE(v_qty.unit, unit), updated_at = NOW()
    WHERE id = v_qty.shopping_session_item_id AND shopping_session_id = p_session_id;

    -- An active session hands the quantity to the list when it completes below; a completed one already did.
    IF v_session.status = 'completed' THEN
      UPDATE public.base_list_items bli
      SET quantity = v_qty.quantity, unit = COALESCE(v_qty.unit, bli.unit), updated_at = NOW()
      FROM public.shopping_session_items ssi
      WHERE ssi.id = v_qty.shopping_session_item_id
        AND bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name;
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
