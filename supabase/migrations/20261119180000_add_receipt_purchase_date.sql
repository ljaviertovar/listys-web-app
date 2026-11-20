ALTER TABLE public.tickets ADD COLUMN purchase_date date;

CREATE INDEX idx_tickets_user_purchase_date ON public.tickets (user_id, purchase_date)
  WHERE purchase_date IS NOT NULL;

CREATE FUNCTION public.spending_summary_by_purchase_date(
  p_from timestamptz, p_to timestamptz, p_purchase_from date, p_purchase_to date, p_time_zone text
)
RETURNS TABLE(
  total numeric, trips_count bigint, receipts_count bigint, trips_without_total bigint,
  first_purchase_date date, last_purchase_date date
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  WITH trips AS (
    SELECT ss.total_amount FROM public.shopping_sessions ss
    WHERE ss.user_id = v_user_id AND ss.status = 'completed'
      AND ss.completed_at >= p_from AND ss.completed_at < p_to
  ), receipts AS (
    SELECT t.total_amount FROM public.tickets t
    WHERE t.user_id = v_user_id AND t.shopping_session_id IS NULL
      AND (
        (p_purchase_from IS NULL AND p_purchase_to IS NULL)
        OR (t.purchase_date >= p_purchase_from AND t.purchase_date < p_purchase_to)
        OR (t.purchase_date IS NULL AND t.created_at >= p_from AND t.created_at < p_to)
      )
  ), purchase_dates AS (
    SELECT COALESCE(t.purchase_date, (t.created_at AT TIME ZONE p_time_zone)::date) AS purchase_day
    FROM public.tickets t WHERE t.user_id = v_user_id
  )
  SELECT COALESCE((SELECT SUM(t.total_amount) FROM trips t), 0)
       + COALESCE((SELECT SUM(r.total_amount) FROM receipts r), 0),
         (SELECT COUNT(t.total_amount) FROM trips t),
         (SELECT COUNT(r.total_amount) FROM receipts r),
         (SELECT COUNT(*) FROM trips t WHERE t.total_amount IS NULL),
         (SELECT MIN(d.purchase_day) FROM purchase_dates d),
         (SELECT MAX(d.purchase_day) FROM purchase_dates d);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.spending_summary_by_purchase_date(timestamptz, timestamptz, date, date, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spending_summary_by_purchase_date(timestamptz, timestamptz, date, date, text)
  TO authenticated;
