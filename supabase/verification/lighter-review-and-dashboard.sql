-- =============================================
-- VERIFICATION: lighter receipt review and dashboard reads
-- Covers migration 20261029000000_lighter_review_and_dashboard.sql
-- =============================================
-- Run only after the approved database has both Phase 4 and Phase 5 migrations applied.
-- This is ONE transaction with synthetic auth.users, fixture rows, and a final ROLLBACK. It does not touch real users.
-- Checks recorded here: suggestion ranking/matching/ownership; cadence cutoffs/order/limits/ownership/history;
-- spending composition/date bounds/ownership; last-visit selection/attachment/ownership; read-only row counts.
-- Run as one writable SQL batch with a runner that supports multi-statement transactions.
-- Every returned row must have ok = true. No checks are considered run until this script is executed on an approved DB.
-- Execution record (2026-10-28): hosted listys project, 25/25 checks passed via the Supabase Management API; the
-- transaction rolled back. Counts before/after: tickets 14, ticket_items 314, shopping_sessions 18,
-- base_list_items 103, stores 3.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  g1 UUID := gen_random_uuid();
  g2 UUID := gen_random_uuid();
  l1 UUID := gen_random_uuid();
  l2 UUID := gen_random_uuid();
  l3 UUID := gen_random_uuid();
  shared_list UUID := gen_random_uuid();
  s1 UUID := gen_random_uuid();
  s2 UUID := gen_random_uuid();
  s3 UUID := gen_random_uuid();
  s_foreign UUID := gen_random_uuid();
  item_org UUID := gen_random_uuid();
  item_banana UUID := gen_random_uuid();
  item_due UUID := gen_random_uuid();
  item_not_due UUID := gen_random_uuid();
  item_two UUID := gen_random_uuid();
  item_short UUID := gen_random_uuid();
  item_four UUID := gen_random_uuid();
  item_120 UUID := gen_random_uuid();
  t_match UUID := gen_random_uuid();
  t_suggestion UUID := gen_random_uuid();
  t_spend UUID := gen_random_uuid();
  t_attached UUID := gen_random_uuid();
  t_visit UUID := gen_random_uuid();
  t_foreign UUID := gen_random_uuid();
  ti_tie UUID;
  sess1 UUID := gen_random_uuid();
  sess2 UUID := gen_random_uuid();
  sess_attached UUID := gen_random_uuid();
  sess_foreign UUID := gen_random_uuid();
  before_tickets BIGINT;
  before_ticket_items BIGINT;
  before_sessions BIGINT;
  before_items BIGINT;
  before_stores BIGINT;
  n BIGINT;
  v_has_history BOOLEAN;
  v_ids UUID[];
  v_names TEXT[];
  v_order TEXT[];
  v_value NUMERIC;
  code TEXT;
  r RECORD;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid'),
         (u3, 'authenticated', 'authenticated', u3 || '@verify.invalid');

  INSERT INTO public.groups (id, user_id, name) VALUES (g1, u1, 'Verification'), (g2, u2, 'Verification');
  INSERT INTO public.base_lists (id, group_id, user_id, name, created_at)
  VALUES (l1, g1, u1, 'Pantry', NOW() - INTERVAL '20 days'),
         (l2, g1, u1, 'Office', NOW() - INTERVAL '10 days'),
         (l3, g1, u1, 'Suggestion Fixture', NOW() - INTERVAL '5 days'),
         (shared_list, g2, u2, 'Shared', NOW() - INTERVAL '30 days');
  INSERT INTO public.list_collaborators (base_list_id, user_id, invited_by)
  VALUES (shared_list, u1, u2);

  INSERT INTO public.stores (id, user_id, name, normalized_name)
  VALUES (s1, u1, 'Market One', 'marketone'), (s2, u1, 'Attached Trip', 'attachedtrip'),
         (s3, u1, 'No Visits', 'novisits'), (s_foreign, u2, 'Foreign Store', 'foreignstore');

  INSERT INTO public.base_list_items
    (id, base_list_id, name, normalized_name, purchase_count, first_seen_at, last_purchased_at, usual_store_id)
  VALUES
    (item_org, l1, 'Organic Bananas', 'organic bananas', 5, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NULL),
    (item_banana, l1, 'Bananas', 'bananas', 2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days', NULL),
    (item_due, l1, 'Due Item', 'due item', 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', NULL),
    (item_not_due, l1, 'Not Due', 'not due', 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', NULL),
    (item_two, l1, 'Two Purchases', 'two purchases', 2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', NULL),
    (item_short, l1, 'Short Interval', 'short interval', 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', NULL),
    (item_four, l1, 'Four Interval Cap', 'four interval cap', 3, NOW() - INTERVAL '101 days', NOW() - INTERVAL '90 days', NULL),
    (item_120, l1, '120 Day Cap', '120 day cap', 3, NOW() - INTERVAL '401 days', NOW() - INTERVAL '200 days', NULL),
    (gen_random_uuid(), l3, 'Organic Bananas', 'organic bananas', 4, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NULL),
    (gen_random_uuid(), shared_list, 'Collaborator Item', 'collaborator item', 5, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NULL);

  INSERT INTO public.base_list_item_aliases (base_list_id, base_list_item_id, alias_key)
  VALUES (l1, item_banana, 'banana bunch');

  INSERT INTO public.tickets
    (id, user_id, image_path, base_list_id, store_id, ocr_status, created_at, total_amount, shopping_session_id)
  VALUES
    (t_match, u1, 'verify/matches.jpg', NULL, NULL, 'completed', NOW(), NULL, NULL),
    (t_suggestion, u1, 'verify/suggestion.jpg', NULL, NULL, 'completed', NOW(), NULL, NULL),
    (t_spend, u1, 'verify/spend.jpg', NULL, s1, 'completed', '2026-06-15 12:00:00+00', 6.50, NULL),
    (t_attached, u1, 'verify/attached.jpg', NULL, s2, 'completed', '2026-06-20 12:00:00+00', 17.00, NULL),
    (t_visit, u1, 'verify/visit.jpg', NULL, s1, 'completed', NOW() - INTERVAL '1 day', 4.00, NULL),
    (t_foreign, u2, 'verify/foreign.jpg', NULL, NULL, 'completed', NOW(), NULL, NULL);

  INSERT INTO public.ticket_items (id, ticket_id, name, normalized_name, price)
  VALUES (gen_random_uuid(), t_match, 'ORG BANANAS', 'org bananas', 2.00),
         (gen_random_uuid(), t_match, 'Bananas', 'bananas', 1.00),
         (gen_random_uuid(), t_match, 'Banana Bunch', 'banana bunch', 1.00),
         (gen_random_uuid(), t_match, 'zzzzzz', 'zzzzzz', 1.00),
         (gen_random_uuid(), t_match, '   ', '', 1.00);
  INSERT INTO public.ticket_items (ticket_id, name, normalized_name, price)
  VALUES (t_suggestion, 'ORG BANANAS', 'org bananas', 2.00);

  INSERT INTO public.shopping_sessions
    (id, base_list_id, user_id, name, status, total_amount, started_at, completed_at, store_id)
  VALUES
    (sess1, l1, u1, 'Trip known', 'completed', 20.00, '2026-06-01 10:00:00+00', '2026-06-10 12:00:00+00', s1),
    (sess2, l1, u1, 'Trip missing total', 'completed', NULL, '2026-06-02 10:00:00+00', '2026-06-11 12:00:00+00', s1),
    (sess_attached, l1, u1, 'Trip with attached receipt', 'completed', 30.00, '2026-06-03 10:00:00+00', '2026-06-21 12:00:00+00', s2),
    (sess_foreign, shared_list, u2, 'Collaborator trip', 'completed', 99.00, '2026-06-01 10:00:00+00', '2026-06-12 12:00:00+00', s_foreign);

  PERFORM set_config('listys.learning', 'on', TRUE);
  UPDATE public.tickets SET shopping_session_id = sess_attached WHERE id = t_attached;
  PERFORM set_config('listys.learning', 'off', TRUE);

  SELECT COUNT(*) INTO before_tickets FROM public.tickets;
  SELECT COUNT(*) INTO before_ticket_items FROM public.ticket_items;
  SELECT COUNT(*) INTO before_sessions FROM public.shopping_sessions;
  SELECT COUNT(*) INTO before_items FROM public.base_list_items;
  SELECT COUNT(*) INTO before_stores FROM public.stores;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::TEXT, TRUE);
  SET LOCAL ROLE authenticated;

  -- Suggestions: abbreviation, name/alias suppression, empty/irrelevant names, purchase-count tie-break.
  SELECT ARRAY_AGG(base_list_item_name ORDER BY base_list_item_name) INTO v_names
  FROM public.ticket_item_suggestions(t_suggestion, l3);
  INSERT INTO verification_results VALUES ('suggestions return the closest abbreviated-name match',
    EXISTS (SELECT 1 FROM public.ticket_item_suggestions(t_suggestion, l3) WHERE base_list_item_name = 'Organic Bananas'),
    COALESCE(array_to_string(v_names, ', '), 'none'));
  INSERT INTO verification_results VALUES ('name and alias matches receive no suggestion',
    NOT EXISTS (
      SELECT 1 FROM public.ticket_item_suggestions(t_match, l1) s
      JOIN public.ticket_items ti ON ti.id = s.ticket_item_id
      WHERE ti.normalized_name IN ('bananas', 'banana bunch')
    ), 'name/alias matches omitted');
  INSERT INTO verification_results VALUES ('empty and below-threshold names receive no suggestion',
    NOT EXISTS (
      SELECT 1 FROM public.ticket_item_suggestions(t_match, l1) s
      JOIN public.ticket_items ti ON ti.id = s.ticket_item_id
      WHERE ti.normalized_name IN ('', 'zzzzzz')
    ), 'empty/unrelated names omitted');
  INSERT INTO public.base_list_items
    (base_list_id, name, normalized_name, purchase_count, first_seen_at, last_purchased_at)
  VALUES (l2, 'Org Bananas A', 'org bananas a', 3, NOW() - INTERVAL '3 days', NOW()),
         (l2, 'Org Bananas B', 'org bananas b', 8, NOW() - INTERVAL '3 days', NOW()),
         (l2, 'A Tie', 'a tie', 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'),
         (l2, 'B Tie', 'b tie', 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days');
  INSERT INTO public.ticket_items (ticket_id, name, normalized_name, price)
  VALUES (t_match, 'Org Bananas', 'org bananas', 2.00) RETURNING id INTO ti_tie;
  INSERT INTO verification_results
  SELECT 'suggestion ties prefer the item with more purchases',
         (SELECT s.base_list_item_name = 'Org Bananas B'
          FROM public.ticket_item_suggestions(t_match, l2) s
          JOIN public.ticket_items ti ON ti.id = s.ticket_item_id
          WHERE ti.id = ti_tie), 'higher purchase_count wins';

  INSERT INTO public.base_list_items (base_list_id, name, normalized_name, purchase_count, first_seen_at, last_purchased_at)
  SELECT l1, 'Limit ' || i, 'limit ' || i, 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
  FROM generate_series(1, 11) i;

  BEGIN
    PERFORM * FROM public.ticket_item_suggestions(t_foreign, l1);
    INSERT INTO verification_results VALUES ('foreign ticket returns P0002', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('foreign ticket returns P0002', code = 'P0002', code);
  END;
  BEGIN
    PERFORM * FROM public.ticket_item_suggestions(t_match, shared_list);
    INSERT INTO verification_results VALUES ('foreign list returns P0002', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('foreign list returns P0002', code = 'P0002', code);
  END;

  -- Likely needed: due rules, caps, deterministic ordering, limit bounds, own-list scope and history metadata.
  SELECT ARRAY_AGG(x.id ORDER BY x.id), BOOL_OR(x.has_history) INTO v_ids, v_has_history
  FROM public.likely_needed_items(10) x WHERE x.id IS NOT NULL;
  INSERT INTO verification_results VALUES ('due item is returned and not-due/two-purchase/sub-day items are excluded',
    item_due = ANY(COALESCE(v_ids, ARRAY[]::UUID[]))
    AND item_not_due <> ALL(COALESCE(v_ids, ARRAY[]::UUID[]))
    AND item_two <> ALL(COALESCE(v_ids, ARRAY[]::UUID[]))
    AND item_short <> ALL(COALESCE(v_ids, ARRAY[]::UUID[])), COALESCE(array_length(v_ids, 1), 0)::TEXT);
  INSERT INTO verification_results VALUES ('four-interval and 120-day cutoffs exclude overdue items',
    item_four <> ALL(COALESCE(v_ids, ARRAY[]::UUID[])) AND item_120 <> ALL(COALESCE(v_ids, ARRAY[]::UUID[])), 'both capped');
  SELECT ARRAY_AGG(x.name) INTO v_order FROM public.likely_needed_items(10) x WHERE x.id IS NOT NULL;
  INSERT INTO verification_results VALUES ('cadence ties break by name after equal ratios and dates',
    array_position(v_order, 'A Tie') < array_position(v_order, 'B Tie'), COALESCE(array_to_string(v_order, ', '), 'none'));
  INSERT INTO verification_results VALUES ('collaborator-owned list items are excluded and history is true',
    NOT EXISTS (SELECT 1 FROM public.likely_needed_items(10) x WHERE x.id IS NOT NULL AND x.base_list_id = shared_list)
    AND v_has_history, 'owner-only rows');
  SELECT COUNT(*) INTO n FROM public.likely_needed_items(0) x WHERE x.id IS NOT NULL;
  INSERT INTO verification_results VALUES ('likely-needed limit clamps to minimum one', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.likely_needed_items(100) x WHERE x.id IS NOT NULL;
  INSERT INTO verification_results VALUES ('likely-needed limit clamps to maximum ten', n = 10, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.likely_needed_items(10) x WHERE x.id IS NOT NULL;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::TEXT, TRUE);
  SELECT BOOL_OR(has_history) INTO v_has_history FROM public.likely_needed_items(10);
  INSERT INTO verification_results VALUES ('empty due result carries the no-history sentinel', v_has_history IS FALSE, COALESCE(v_has_history::TEXT, 'no rows'));
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::TEXT, TRUE);

  -- Spending: known totals, attached receipt exclusion, missing-trip count, half-open boundaries and owner scope.
  SELECT total INTO v_value FROM public.spending_summary('2026-06-01 00:00:00+00', '2026-07-01 00:00:00+00');
  INSERT INTO verification_results VALUES ('spending sums known trip and unattached receipt totals only', v_value = 56.50, v_value::TEXT);
  INSERT INTO verification_results
  SELECT 'spending counts contributing trips/receipts and null-total trips',
    trips_count = 2 AND receipts_count = 1 AND trips_without_total = 1,
    trips_count || '/' || receipts_count || '/' || trips_without_total
  FROM public.spending_summary('2026-06-01 00:00:00+00', '2026-07-01 00:00:00+00');
  INSERT INTO public.tickets (user_id, image_path, ocr_status, created_at, total_amount)
  VALUES (u1, 'verify/boundary.jpg', 'completed', '2026-07-01 00:00:00+00', 500.00);
  INSERT INTO verification_results
  SELECT 'spending range is half-open at to', total = 56.50,
    total::TEXT FROM public.spending_summary('2026-06-01 00:00:00+00', '2026-07-01 00:00:00+00');

  -- Last visits: latest trip/receipt, attached receipt collapsed to trip, no-visit store and user filtering.
  INSERT INTO verification_results
  SELECT 'last visit picks the newest unattached receipt', kind = 'receipt' AND id = t_visit AND total_amount = 4.00,
    kind || '/' || id::TEXT FROM public.store_last_visits() WHERE store_id = s1;
  INSERT INTO verification_results VALUES ('store without visits is absent from last visits',
    NOT EXISTS (SELECT 1 FROM public.store_last_visits() WHERE store_id = s3), 'no visit row');
  INSERT INTO verification_results VALUES ('foreign-owned store data is excluded',
    NOT EXISTS (SELECT 1 FROM public.store_last_visits() WHERE store_id = s_foreign), 'owner-only rows');
  INSERT INTO verification_results
  SELECT 'attached receipt is represented once by its trip', kind = 'trip' AND id = sess_attached,
    kind || '/' || id::TEXT FROM public.store_last_visits() WHERE store_id = s2;

  RESET ROLE;
  SELECT COUNT(*) INTO n FROM public.tickets;
  INSERT INTO verification_results VALUES ('read checks preserve ticket row count', n = before_tickets + 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.ticket_items;
  INSERT INTO verification_results VALUES ('read checks preserve ticket-item row count', n = before_ticket_items + 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.shopping_sessions;
  INSERT INTO verification_results VALUES ('read checks preserve shopping-session row count', n = before_sessions, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_items;
  INSERT INTO verification_results VALUES ('read checks preserve base-list-item row count', n = before_items + 15, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.stores;
  INSERT INTO verification_results VALUES ('read checks preserve store row count', n = before_stores, n::TEXT);
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;
ROLLBACK;
