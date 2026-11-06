CREATE OR REPLACE FUNCTION public.store_last_visits()
RETURNS TABLE(store_id UUID, kind TEXT, id UUID, at TIMESTAMPTZ, total_amount NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT DISTINCT ON (visits.store_id)
    visits.store_id, visits.kind, visits.id, visits.at, visits.total_amount
  FROM (
    -- A trip without receipts still uses its selected store and trip total.
    SELECT ss.store_id, 'trip'::TEXT AS kind, ss.id,
      ss.completed_at AS at, ss.total_amount
    FROM public.shopping_sessions ss
    WHERE ss.user_id = v_user_id AND ss.store_id IS NOT NULL
      AND ss.status = 'completed' AND ss.completed_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.user_id = v_user_id AND t.shopping_session_id = ss.id
      )

    UNION ALL

    -- Each attached receipt contributes only its own store and paid total.
    SELECT t.store_id, 'trip'::TEXT AS kind, ss.id,
      ss.completed_at AS at, COALESCE(t.attached_total_amount, t.total_amount)
    FROM public.shopping_sessions ss
    JOIN public.tickets t ON t.shopping_session_id = ss.id AND t.user_id = v_user_id
    WHERE ss.user_id = v_user_id AND ss.status = 'completed'
      AND ss.completed_at IS NOT NULL AND t.store_id IS NOT NULL

    UNION ALL

    SELECT t.store_id, 'receipt'::TEXT AS kind, t.id,
      t.created_at AS at, t.total_amount
    FROM public.tickets t
    WHERE t.user_id = v_user_id AND t.store_id IS NOT NULL
      AND t.shopping_session_id IS NULL
  ) visits
  JOIN public.stores s ON s.id = visits.store_id AND s.user_id = v_user_id
  ORDER BY visits.store_id, visits.at DESC,
    CASE visits.kind WHEN 'trip' THEN 0 ELSE 1 END, visits.id;
END;
$$;
