-- Apply as a versioned migration only after all duplicate active trips have been resolved manually.
BEGIN;
LOCK TABLE public.shopping_sessions IN SHARE ROW EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.shopping_sessions WHERE status = 'active'
    GROUP BY user_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Resolve duplicate active trips before enabling the unique account index';
  END IF;
END;
$$;
CREATE UNIQUE INDEX uq_shopping_sessions_one_active_per_account
ON public.shopping_sessions (user_id) WHERE status = 'active';
DROP INDEX public.shopping_sessions_active_owner_lookup;
DROP TRIGGER guard_one_active_trip_per_account ON public.shopping_sessions;
DROP FUNCTION private.guard_one_active_trip_per_account();

CREATE OR REPLACE FUNCTION public.start_shopping_session(
  p_base_list_id UUID,
  p_name TEXT,
  p_store_id UUID DEFAULT NULL
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

  BEGIN
    INSERT INTO public.shopping_sessions (base_list_id, user_id, name, status, store_id)
    VALUES (p_base_list_id, v_user_id, btrim(p_name), 'active', p_store_id)
    RETURNING * INTO v_session;
  EXCEPTION WHEN unique_violation THEN
    SELECT ss.id INTO v_session.id FROM public.shopping_sessions ss
    WHERE ss.user_id = v_user_id AND ss.status = 'active'
    ORDER BY ss.started_at DESC NULLS LAST, ss.id LIMIT 1;
    IF FOUND THEN
      RAISE EXCEPTION 'ACCOUNT_TRIP_ALREADY_ACTIVE' USING ERRCODE = 'P0001', DETAIL = v_session.id::text;
    END IF;
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

COMMIT;
