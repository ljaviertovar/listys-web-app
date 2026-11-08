-- Non-destructive review: all migration-time statements below preserve records.
-- ALTER adds nullable fields/FKs; the backfill only copies the existing session total.
-- DROP INDEX removes the former one-receipt constraint, never data. The new index
-- permits several receipts but keeps one per confirmed store. Historical line decisions
-- are unknown and intentionally remain NULL. Function/trigger definitions do not run
-- attachment, completion or deletion during migration. Never reset a database to test this.

ALTER TABLE public.tickets
  ADD COLUMN attached_total_amount NUMERIC(12, 2) NULL
    CHECK (attached_total_amount IS NULL OR attached_total_amount >= 0);

UPDATE public.tickets t
SET attached_total_amount = ss.total_amount
FROM public.shopping_sessions ss
WHERE ss.id = t.shopping_session_id AND ss.user_id = t.user_id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tickets
    WHERE shopping_session_id IS NOT NULL AND store_id IS NOT NULL
    GROUP BY shopping_session_id, store_id HAVING COUNT(*) > 1
  ) THEN RAISE EXCEPTION 'Duplicate receipt stores must be resolved before migration'; END IF;
END;
$$;
DROP INDEX public.uq_tickets_shopping_session_id;
CREATE UNIQUE INDEX uq_tickets_shopping_session_store
  ON public.tickets(shopping_session_id, store_id)
  WHERE shopping_session_id IS NOT NULL AND store_id IS NOT NULL;
CREATE INDEX idx_tickets_attached_session ON public.tickets(shopping_session_id)
  WHERE shopping_session_id IS NOT NULL;

ALTER TABLE public.ticket_items
  ADD COLUMN shopping_session_item_id UUID NULL
    REFERENCES public.shopping_session_items(id) ON DELETE SET NULL;
CREATE INDEX idx_ticket_items_session_item ON public.ticket_items(shopping_session_item_id)
  WHERE shopping_session_item_id IS NOT NULL;

CREATE FUNCTION public.guard_receipt_line_target()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.shopping_session_item_id IS NOT DISTINCT FROM OLD.shopping_session_item_id
    AND NEW.ticket_id IS NOT DISTINCT FROM OLD.ticket_id THEN
    RETURN NEW;
  END IF;
  -- A foreign-key cleanup may clear a deleted target without discarding the receipt line.
  IF NEW.shopping_session_item_id IS NULL THEN
    IF TG_OP = 'INSERT' THEN RETURN NEW; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.shopping_session_items WHERE id = OLD.shopping_session_item_id) THEN
      RETURN NEW;
    END IF;
  END IF;
  IF current_setting('listys.learning', TRUE) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Receipt line targets can only be changed by the attach operation' USING ERRCODE = '42501';
  END IF;
  IF NEW.shopping_session_item_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.ticket_items ti
    JOIN public.tickets t ON t.id = NEW.ticket_id
    JOIN public.shopping_session_items ssi ON ssi.id = NEW.shopping_session_item_id
    JOIN public.shopping_sessions ss ON ss.id = ssi.shopping_session_id
    WHERE ti.id = NEW.id AND t.user_id = auth.uid() AND ss.user_id = auth.uid()
      AND ss.id = COALESCE(t.shopping_session_id, t.uploaded_from_session_id)
  ) THEN
    RAISE EXCEPTION 'Receipt line target is outside its trip' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_receipt_line_target
  BEFORE INSERT OR UPDATE OF shopping_session_item_id, ticket_id ON public.ticket_items
  FOR EACH ROW EXECUTE FUNCTION public.guard_receipt_line_target();

-- Removing a receipt preserves item prices and the last total when no known totals remain.
CREATE FUNCTION public.refresh_trip_paid_total_after_receipt_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF OLD.shopping_session_id IS NOT NULL THEN
    PERFORM 1 FROM public.shopping_sessions WHERE id = OLD.shopping_session_id FOR UPDATE;
    UPDATE public.shopping_sessions ss
    SET total_amount = COALESCE((SELECT SUM(t.attached_total_amount) FROM public.tickets t
          WHERE t.shopping_session_id = ss.id), ss.total_amount), updated_at = NOW()
    WHERE ss.id = OLD.shopping_session_id AND ss.user_id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER refresh_trip_paid_total_after_receipt_delete
  AFTER DELETE ON public.tickets FOR EACH ROW
  EXECUTE FUNCTION public.refresh_trip_paid_total_after_receipt_delete();

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
  v_receipt_store_id UUID;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT t.uploaded_from_session_id, t.store_id INTO v_origin_session_id, v_receipt_store_id
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
    AND NOT EXISTS (SELECT 1 FROM public.tickets attached
      WHERE attached.shopping_session_id = ss.id AND v_receipt_store_id IS NOT NULL
        AND attached.store_id = v_receipt_store_id)
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
  p_links JSONB,
  p_added_item_ids UUID[],
  p_total_amount NUMERIC,
  p_max_items INTEGER,
  p_complete_session BOOLEAN
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
  v_ticket_item RECORD;
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
  v_old_prices JSONB;
  v_old_checked JSONB;
  v_had_receipts BOOLEAN;
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

  IF v_ticket.ocr_status <> 'completed' THEN
    RAISE EXCEPTION 'RECEIPT_NOT_READ' USING ERRCODE = 'P0001';
  END IF;
  IF v_ticket.base_list_id IS NOT NULL THEN
    RAISE EXCEPTION 'RECEIPT_ADDED_TO_LIST' USING ERRCODE = 'P0001';
  END IF;
  -- A completed trip takes a receipt however long ago it was completed: the receipt only adds prices, the total and quantities.

  v_original_store_id := v_session.store_id;
  SELECT EXISTS (SELECT 1 FROM public.tickets WHERE shopping_session_id = p_session_id) INTO v_had_receipts;
  v_store_id := v_ticket.store_id;
  IF v_store_id IS NULL AND NOT EXISTS (
    SELECT 1 FROM public.tickets WHERE shopping_session_id = p_session_id AND store_id = v_session.store_id
  ) THEN v_store_id := v_session.store_id; END IF;
  IF v_store_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tickets WHERE shopping_session_id = p_session_id AND store_id = v_store_id
  ) THEN RAISE EXCEPTION 'This trip already has a receipt from this store'
    USING ERRCODE = '23505', DETAIL = 'SESSION_HAS_STORE_RECEIPT'; END IF;
  IF v_ticket.uploaded_from_session_id IS NOT NULL AND v_ticket.uploaded_from_session_id <> p_session_id THEN
    RAISE EXCEPTION 'Receipt belongs to another origin trip' USING ERRCODE = '23505', DETAIL = 'RECEIPT_NOT_FROM_TRIP';
  END IF;
  IF p_complete_session IS NULL THEN RAISE EXCEPTION 'Completion choice is required' USING ERRCODE = '22023'; END IF;

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
  UPDATE public.shopping_sessions SET store_id = COALESCE(store_id, v_store_id), updated_at = NOW()
  WHERE id = p_session_id;
  SELECT COALESCE(jsonb_object_agg(id::TEXT, price), '{}'::JSONB),
    COALESCE(jsonb_object_agg(id::TEXT, checked), '{}'::JSONB) INTO v_old_prices, v_old_checked
  FROM public.shopping_session_items WHERE shopping_session_id = p_session_id;
  -- Set the owning trip before writing line targets; the guard verifies both ownership and trip.
  UPDATE public.tickets SET shopping_session_id = p_session_id, base_list_id = v_session.base_list_id,
    store_id = v_store_id, attached_total_amount = COALESCE(p_total_amount, total_amount)
  WHERE id = p_ticket_id AND user_id = v_user_id;
  UPDATE public.shopping_sessions ss
  SET total_amount = COALESCE((SELECT SUM(t.attached_total_amount) FROM public.tickets t
    WHERE t.shopping_session_id = p_session_id), ss.total_amount), updated_at = NOW()
  WHERE ss.id = p_session_id;

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
        UPDATE public.shopping_session_items SET checked = TRUE, price = CASE WHEN v_had_receipts THEN price ELSE NULL END, updated_at = NOW() WHERE id = v_target_id;
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
    UPDATE public.ticket_items SET shopping_session_item_id = v_target_id WHERE id = v_ticket_item.id;
  END LOOP;

  -- The quantity bought replaces the planned/usual one (never added to it). Only matched items change: lines added as
  -- purchased already carry their own quantity, and checked items no line covers keep theirs. Lines of mixed units are
  -- ambiguous to add up, so those items keep quantity and unit; a line without a unit leaves the item's unit alone.
  FOR v_qty IN
    WITH line_totals AS (
      SELECT ti.shopping_session_item_id,
        SUM(COALESCE(ti.quantity, 1)) AS quantity, MIN(ti.unit) AS unit,
        COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) AS unit_kinds
      FROM public.ticket_items ti JOIN public.tickets t ON t.id = ti.ticket_id
      WHERE t.shopping_session_id = p_session_id AND ti.shopping_session_item_id = ANY(v_receipt_target_ids)
      GROUP BY ti.shopping_session_item_id
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

  IF v_session.status = 'active' AND p_complete_session THEN
    SELECT * INTO v_core FROM public.apply_session_completion(p_session_id, p_max_items);
    completed_now := TRUE;
    over_limit_count := v_core.over_limit_count;
  ELSIF v_session.status = 'completed' THEN
    completed_now := FALSE;
    -- Existing purchases were already counted. A newly attached line is a new purchase; a matched line only adds its receipt price.
    SELECT COUNT(*) INTO v_current_count FROM public.base_list_items WHERE base_list_id = v_session.base_list_id;
    FOR v_ticket_item IN
      SELECT ssi.* FROM public.shopping_session_items ssi
      WHERE ssi.id = ANY(v_item_ids) AND COALESCE((v_old_checked ->> ssi.id::TEXT)::BOOLEAN, FALSE) IS FALSE
      ORDER BY ssi.created_at, ssi.id
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
    END LOOP;

    -- Receipt prices refine a purchase already counted when the session was completed.
    UPDATE public.base_list_items bli
    SET average_price = CASE
      WHEN ssi.price IS NULL THEN bli.average_price
      WHEN bli.average_price IS NULL OR COALESCE(bli.purchase_count, 0) <= 0 THEN ssi.price
      ELSE bli.average_price + (ssi.price - COALESCE((v_old_prices ->> ssi.id::TEXT)::NUMERIC, bli.average_price)) / bli.purchase_count
      END,
      updated_at = NOW()
    FROM public.shopping_session_items ssi
    WHERE ssi.id = ANY(v_item_ids) AND NOT (bli.id = ANY(v_added_base_item_ids)) AND ssi.normalized_name = bli.normalized_name
      AND bli.base_list_id = v_session.base_list_id;

    PERFORM public.recompute_usual_store(v_added_base_item_ids);
  ELSE
    -- Attaching during shopping records checked items and prices. Completion learns purchases later.
    completed_now := FALSE;
  END IF;

  IF v_session.status = 'completed' AND v_store_id IS NOT NULL THEN
    INSERT INTO public.base_list_item_store_stats (
      user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
      last_price, last_price_at, last_quantity, last_unit
    )
    SELECT v_user_id, bli.id, v_store_id, 1, NOW(), SUM(ti.price),
      CASE WHEN SUM(ti.price) IS NULL THEN NULL ELSE NOW() END,
      SUM(COALESCE(ti.quantity, 1)),
      CASE WHEN COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) = 1 THEN MIN(ti.unit) END
    FROM public.ticket_items ti
    JOIN public.shopping_session_items ssi ON ssi.id = ti.shopping_session_item_id
    JOIN public.base_list_items bli ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
    WHERE ti.ticket_id = p_ticket_id
    GROUP BY bli.id
    ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
      -- Completion already counted a planned purchase at the trip's store; attaching only refines that store price.
      purchase_count = base_list_item_store_stats.purchase_count + CASE WHEN v_store_id = v_original_store_id AND NOT (EXCLUDED.base_list_item_id = ANY(v_added_base_item_ids)) THEN 0 ELSE 1 END,
      last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
      last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
      last_purchased_at = EXCLUDED.last_purchased_at, last_quantity = EXCLUDED.last_quantity, last_unit = EXCLUDED.last_unit;
    PERFORM public.recompute_usual_store(ARRAY(
      SELECT DISTINCT bli.id FROM public.ticket_items ti
      JOIN public.shopping_session_items ssi ON ssi.id = ti.shopping_session_item_id
      JOIN public.base_list_items bli ON bli.base_list_id = v_session.base_list_id AND bli.normalized_name = ssi.normalized_name
      WHERE ti.ticket_id = p_ticket_id
    ));
  END IF;

  matched_count := COALESCE(matched_count, 0);
  checked_now_count := COALESCE(checked_now_count, 0);
  added_count := COALESCE(added_count, 0);
  priced_count := COALESCE(priced_count, 0);
  over_limit_count := COALESCE(over_limit_count, 0);
  replayed := v_replayed;
  RETURN NEXT;
END;
$$;


-- Preserve the established six-argument SQL contract without ambiguous default overloads.
CREATE OR REPLACE FUNCTION public.attach_receipt_to_session(
  p_ticket_id UUID, p_session_id UUID, p_links JSONB DEFAULT '[]'::JSONB,
  p_added_item_ids UUID[] DEFAULT ARRAY[]::UUID[], p_total_amount NUMERIC DEFAULT NULL, p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(completed_now BOOLEAN, matched_count INTEGER, checked_now_count INTEGER,
  added_count INTEGER, priced_count INTEGER, over_limit_count INTEGER, replayed BOOLEAN)
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM public.attach_receipt_to_session(p_ticket_id, p_session_id, p_links,
    p_added_item_ids, p_total_amount, p_max_items, TRUE);
$$;
REVOKE EXECUTE ON FUNCTION public.attach_receipt_to_session(UUID,UUID,JSONB,UUID[],NUMERIC,INTEGER,BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attach_receipt_to_session(UUID,UUID,JSONB,UUID[],NUMERIC,INTEGER,BOOLEAN) TO authenticated;

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

  IF cardinality(v_learning_item_ids) > 0 THEN
    PERFORM set_config('listys.learning', 'on', TRUE);
    -- Known receipt destinations determine the store; only uncovered items use the trip's planned store.
    INSERT INTO public.base_list_item_store_stats (
      user_id, base_list_item_id, store_id, purchase_count, last_purchased_at,
      last_price, last_price_at, last_quantity, last_unit
    )
    WITH bought AS (
      SELECT bli.id AS item_id, t.store_id, SUM(ti.price) AS price,
        SUM(COALESCE(ti.quantity, 1)) AS quantity,
        CASE WHEN COUNT(DISTINCT COALESCE(NULLIF(LOWER(BTRIM(ti.unit)), ''), 'each')) = 1 THEN MIN(ti.unit) END AS unit
      FROM public.ticket_items ti JOIN public.tickets t ON t.id = ti.ticket_id
      JOIN public.shopping_session_items ssi ON ssi.id = ti.shopping_session_item_id AND ssi.checked IS TRUE
      JOIN public.base_list_items bli ON bli.base_list_id = v_base_list_id AND bli.normalized_name = ssi.normalized_name
      WHERE t.shopping_session_id = p_session_id AND t.store_id IS NOT NULL AND bli.id = ANY(v_learning_item_ids)
      GROUP BY bli.id, t.store_id
      UNION ALL
      (SELECT DISTINCT ON (bli.id) bli.id, v_store_id, ssi.price, ssi.quantity, ssi.unit
      FROM public.shopping_session_items ssi
      JOIN public.base_list_items bli ON bli.base_list_id = v_base_list_id AND bli.normalized_name = ssi.normalized_name
      WHERE ssi.shopping_session_id = p_session_id AND ssi.checked IS TRUE AND v_store_id IS NOT NULL
        AND bli.id = ANY(v_learning_item_ids)
        AND NOT EXISTS (
          SELECT 1 FROM public.ticket_items ti
          JOIN public.shopping_session_items covered ON covered.id = ti.shopping_session_item_id
          WHERE covered.shopping_session_id = p_session_id AND covered.normalized_name = ssi.normalized_name
        )
      ORDER BY bli.id, ssi.sort_order, ssi.id)
    )
    SELECT v_user_id, bought.item_id, bought.store_id, 1, NOW(), bought.price,
      CASE WHEN bought.price IS NULL THEN NULL ELSE NOW() END, bought.quantity, bought.unit FROM bought
    ON CONFLICT (base_list_item_id, store_id) DO UPDATE SET
      purchase_count = base_list_item_store_stats.purchase_count + 1,
      last_purchased_at = EXCLUDED.last_purchased_at,
      last_price = COALESCE(EXCLUDED.last_price, base_list_item_store_stats.last_price),
      last_price_at = COALESCE(EXCLUDED.last_price_at, base_list_item_store_stats.last_price_at),
      last_quantity = EXCLUDED.last_quantity, last_unit = EXCLUDED.last_unit;
    PERFORM public.recompute_usual_store(v_learning_item_ids);
  END IF;

  touched_item_ids := v_learning_item_ids;
  RETURN NEXT;
END;
$$;
