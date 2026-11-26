-- Items checked as needed for the next trip.
-- Non-destructive review: no migration-time statement reads, rewrites or removes a row. It adds one nullable column
-- and redefines two functions. DROP FUNCTION removes only the three-argument signature of start_shopping_session
-- (never data) so PostgREST is not left with two overloads; existing three-argument calls use the new default.
-- Function definitions do not start or complete trips during migration. Never reset a database to test this.
BEGIN;

ALTER TABLE public.base_list_items ADD COLUMN needed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.base_list_items.needed_at IS
  'When the item was checked as needed for the next trip; NULL when it is not. Cleared when a trip buys it.';

DROP FUNCTION public.start_shopping_session(uuid, text, uuid);

CREATE FUNCTION public.start_shopping_session(
  p_base_list_id UUID,
  p_name TEXT,
  p_store_id UUID DEFAULT NULL,
  p_only_needed BOOLEAN DEFAULT FALSE
)
RETURNS public.shopping_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

  -- The caller confirmed a trip of checked items. If those checks are gone (another device, another store),
  -- refuse instead of starting a different trip from the one on screen.
  IF p_only_needed AND NOT EXISTS (
    SELECT 1 FROM public.base_list_items bli
    WHERE bli.base_list_id = p_base_list_id AND bli.needed_at IS NOT NULL
      AND (p_store_id IS NULL OR bli.usual_store_id = p_store_id OR EXISTS (
        SELECT 1 FROM public.base_list_item_store_stats stats
        WHERE stats.base_list_item_id = bli.id AND stats.store_id = p_store_id
      ))
  ) THEN
    RAISE EXCEPTION 'NO_NEEDED_ITEMS' USING ERRCODE = 'P0001';
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
      AND (NOT COALESCE(p_only_needed, FALSE) OR (
        bli.needed_at IS NOT NULL AND (p_store_id IS NULL OR bli.usual_store_id = p_store_id OR EXISTS (
          SELECT 1 FROM public.base_list_item_store_stats stats
          WHERE stats.base_list_item_id = bli.id AND stats.store_id = p_store_id
        ))
      ))
  ) ordered;

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION public.start_shopping_session(uuid, text, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_shopping_session(uuid, text, uuid, boolean) TO authenticated;

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

    -- Bought: every note asking for this name is done. Unchecked trip items keep theirs for the next trip.
    UPDATE public.base_list_items
    SET needed_at = NULL
    WHERE base_list_id = v_base_list_id AND normalized_name = rec.normalized_name AND needed_at IS NOT NULL;

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

NOTIFY pgrst, 'reload schema';

COMMIT;
