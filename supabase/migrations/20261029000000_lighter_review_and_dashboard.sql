-- Non-destructive review (AGENTS.md: Database & Supabase Patterns)
--
-- Statements, in order:
--   1. The prerequisite DO block reads catalogs and aborts if required Phase 4/5 columns are missing.
--   2. CREATE EXTENSION IF NOT EXISTS pg_trgm enables trigram similarity; it does not alter application rows.
--   3. CREATE OR REPLACE FUNCTION receipt_suggestion_threshold adds a fixed read-only value function.
--   4. CREATE OR REPLACE FUNCTION ticket_item_suggestions adds an owner-checked read-only receipt suggestion RPC.
--   5. CREATE OR REPLACE FUNCTION likely_needed_items adds an owner-filtered read-only list cadence RPC.
--   6. CREATE OR REPLACE FUNCTION spending_summary adds an owner-filtered read-only aggregate RPC.
--   7. CREATE OR REPLACE FUNCTION store_last_visits adds an owner-filtered read-only store visit RPC.
--   8. The two CREATE INDEX IF NOT EXISTS statements add read indexes only.
-- No statement deletes, updates, truncates, drops, backfills, adds columns, or rewrites existing rows. Function bodies
-- only read data when called; the sentinel row in likely_needed_items carries has_history when its result is empty.

DO $$
BEGIN
  IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'shopping_sessions' AND column_name = 'store_id'
     )
     OR NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'base_list_items' AND column_name = 'usual_store_id'
     )
     OR NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'total_amount'
     )
     OR NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'shopping_session_id'
     )
  THEN
    RAISE EXCEPTION 'lighter-review-and-dashboard requires Phase 4 store-tags-and-scoped-sessions and Phase 5 close-the-loop migrations';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.receipt_suggestion_threshold()
RETURNS REAL
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$ SELECT 0.45::REAL $$;

CREATE OR REPLACE FUNCTION public.ticket_item_suggestions(p_ticket_id UUID, p_base_list_id UUID)
RETURNS TABLE(ticket_item_id UUID, base_list_item_id UUID, base_list_item_name TEXT)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  PERFORM 1 FROM public.tickets t WHERE t.id = p_ticket_id AND t.user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002'; END IF;

  PERFORM 1 FROM public.base_lists bl WHERE bl.id = p_base_list_id AND bl.user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Base list not found' USING ERRCODE = 'P0002'; END IF;

  RETURN QUERY
  SELECT DISTINCT ON (ti.id) ti.id, bli.id, bli.name
  FROM public.ticket_items ti
  JOIN public.base_list_items bli ON bli.base_list_id = p_base_list_id
  WHERE ti.ticket_id = p_ticket_id
    AND COALESCE(ti.normalized_name, '') <> ''
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_item_matches(p_ticket_id, p_base_list_id) m
      WHERE m.ticket_item_id = ti.id AND m.match_kind <> 'none'
    )
    AND similarity(ti.normalized_name, bli.normalized_name) >= public.receipt_suggestion_threshold()
  ORDER BY ti.id, similarity(ti.normalized_name, bli.normalized_name) DESC,
           bli.purchase_count DESC, bli.name, bli.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.likely_needed_items(p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  id UUID,
  name TEXT,
  base_list_id UUID,
  base_list_name TEXT,
  usual_store_id UUID,
  usual_store_name TEXT,
  interval_days NUMERIC,
  days_since NUMERIC,
  has_history BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_has_history BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.base_list_items bli
    JOIN public.base_lists bl ON bl.id = bli.base_list_id
    WHERE bl.user_id = v_user_id AND bli.purchase_count >= 3
  ) INTO v_has_history;

  RETURN QUERY
  WITH candidates AS (
    SELECT bli.id, bli.name, bl.id AS base_list_id, bl.name AS base_list_name,
           bli.usual_store_id, st.name AS usual_store_name, bli.last_purchased_at,
           EXTRACT(EPOCH FROM (bli.last_purchased_at - bli.first_seen_at))
             / (86400 * (bli.purchase_count - 1)) AS interval_days,
           EXTRACT(EPOCH FROM (NOW() - bli.last_purchased_at)) / 86400 AS days_since
    FROM public.base_list_items bli
    JOIN public.base_lists bl ON bl.id = bli.base_list_id AND bl.user_id = v_user_id
    LEFT JOIN public.stores st ON st.id = bli.usual_store_id AND st.user_id = v_user_id
    WHERE bli.purchase_count >= 3
  ), due AS (
    SELECT c.* FROM candidates c
    WHERE c.interval_days >= 1
      AND c.days_since >= c.interval_days
      AND c.days_since <= LEAST(4 * c.interval_days, 120)
  )
  SELECT d.id, d.name, d.base_list_id, d.base_list_name, d.usual_store_id, d.usual_store_name,
         d.interval_days::NUMERIC, d.days_since::NUMERIC, v_has_history
  FROM due d
  ORDER BY d.days_since / d.interval_days DESC, d.last_purchased_at ASC, d.name, d.id
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 5), 1), 10);

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::UUID, NULL::TEXT, NULL::UUID, NULL::TEXT,
                        NULL::NUMERIC, NULL::NUMERIC, v_has_history;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.spending_summary(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE(total NUMERIC, trips_count BIGINT, receipts_count BIGINT, trips_without_total BIGINT)
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
  WITH trips AS (
    SELECT ss.total_amount FROM public.shopping_sessions ss
    WHERE ss.user_id = v_user_id AND ss.status = 'completed'
      AND ss.completed_at >= p_from AND ss.completed_at < p_to
  ), receipts AS (
    SELECT t.total_amount FROM public.tickets t
    WHERE t.user_id = v_user_id AND t.shopping_session_id IS NULL
      AND t.created_at >= p_from AND t.created_at < p_to
  )
  SELECT COALESCE((SELECT SUM(t.total_amount) FROM trips t WHERE t.total_amount IS NOT NULL), 0)
       + COALESCE((SELECT SUM(r.total_amount) FROM receipts r WHERE r.total_amount IS NOT NULL), 0),
         (SELECT COUNT(*) FROM trips WHERE total_amount IS NOT NULL),
         (SELECT COUNT(*) FROM receipts WHERE total_amount IS NOT NULL),
         (SELECT COUNT(*) FROM trips WHERE total_amount IS NULL);
END;
$$;

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
  SELECT DISTINCT ON (visits.store_id) visits.store_id, visits.kind, visits.id, visits.at, visits.total_amount
  FROM (
    SELECT ss.store_id, 'trip'::TEXT AS kind, ss.id, ss.completed_at AS at, ss.total_amount
    FROM public.shopping_sessions ss
    WHERE ss.user_id = v_user_id AND ss.store_id IS NOT NULL
      AND ss.status = 'completed' AND ss.completed_at IS NOT NULL
    UNION ALL
    SELECT t.store_id, 'receipt'::TEXT AS kind, t.id, t.created_at AS at, t.total_amount
    FROM public.tickets t
    WHERE t.user_id = v_user_id AND t.store_id IS NOT NULL AND t.shopping_session_id IS NULL
  ) visits
  JOIN public.stores s ON s.id = visits.store_id AND s.user_id = v_user_id
  ORDER BY visits.store_id, visits.at DESC, CASE visits.kind WHEN 'trip' THEN 0 ELSE 1 END, visits.id;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_completed
  ON public.shopping_sessions(user_id, completed_at) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_tickets_user_created
  ON public.tickets(user_id, created_at);
