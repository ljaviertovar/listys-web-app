-- =============================================
-- VERIFICATION: receipt/session reconciliation (PRD v3 Phase 5)
-- Covers migration 20261028000000_close_the_loop.sql
-- =============================================
-- This script creates only synthetic auth users and rows inside one transaction and always ends in ROLLBACK.
-- Run only on a database approved for verification writes after the migration is applied, for example:
--   supabase db query --linked -f supabase/verification/close-the-loop.sql
-- The final result set must contain only ok = true. Run only against an explicitly approved non-production target;
-- fixture rows are synthetic, remain inside this transaction, and are rolled back at the end.

BEGIN;
CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  owner_id UUID := gen_random_uuid();
  other_id UUID := gen_random_uuid();
  collaborator_id UUID := gen_random_uuid();
  group_id UUID;
  other_group_id UUID;
  list_id UUID;
  done_list_id UUID;
  other_list_id UUID;
  after_list_id UUID;
  occupied_list_id UUID;
  foreign_list_id UUID;
  v_store_id UUID;
  other_store_id UUID;
  active_id UUID;
  done_id UUID;
  old_id UUID;
  other_session_id UUID;
  after_session_id UUID;
  occupied_session_id UUID;
  receipt_id UUID;
  done_receipt_id UUID;
  second_receipt_id UUID;
  occupied_receipt_id UUID;
  conflict_receipt_id UUID;
  unread_receipt_id UUID;
  added_receipt_id UUID;
  milk_id UUID;
  bread_id UUID;
  trip_milk_id UUID;
  trip_bread_id UUID;
  trip_unmentioned_id UUID;
  trip_duplicate_id UUID;
  done_milk_id UUID;
  done_trip_milk_id UUID;
  ticket_milk_id UUID;
  ticket_milk_extra_id UUID;
  ticket_bread_id UUID;
  ticket_apple_id UUID;
  ticket_done_milk_id UUID;
  ticket_done_new_id UUID;
  ticket_done_over_id UUID;
  merge_receipt_id UUID;
  merge_item_id UUID;
  n INTEGER;
  before_count INTEGER;
  purchase_count INTEGER;
  avg_price NUMERIC;
  v RECORD;
  code TEXT;
  msg TEXT;
  det TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (owner_id, 'authenticated', 'authenticated', owner_id || '@verify.invalid'),
         (other_id, 'authenticated', 'authenticated', other_id || '@verify.invalid'),
         (collaborator_id, 'authenticated', 'authenticated', collaborator_id || '@verify.invalid');

  INSERT INTO public.groups (user_id, name) VALUES (owner_id, 'Verification') RETURNING id INTO group_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (group_id, owner_id, 'Active') RETURNING id INTO list_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (group_id, owner_id, 'Completed') RETURNING id INTO done_list_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (group_id, owner_id, 'Other') RETURNING id INTO other_list_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (group_id, owner_id, 'Completed after upload') RETURNING id INTO after_list_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (group_id, owner_id, 'Occupied') RETURNING id INTO occupied_list_id;
  INSERT INTO public.groups (user_id, name) VALUES (other_id, 'Foreign') RETURNING id INTO other_group_id;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (other_group_id, other_id, 'Foreign') RETURNING id INTO foreign_list_id;

  INSERT INTO public.stores (user_id, name, normalized_name) VALUES (owner_id, 'Verification Market', 'verificationmarket') RETURNING id INTO v_store_id;
  INSERT INTO public.stores (user_id, name, normalized_name) VALUES (owner_id, 'Other Market', 'othermarket') RETURNING id INTO other_store_id;
  INSERT INTO public.store_aliases (user_id, store_id, alias_key) VALUES (owner_id, v_store_id, 'verificationmarket');
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count, average_price)
  VALUES (list_id, 'Milk', 1, 'each', 0, NULL) RETURNING id INTO milk_id;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count, average_price)
  VALUES (list_id, 'Bread', 1, 'each', 0, NULL) RETURNING id INTO bread_id;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count, average_price)
  VALUES (done_list_id, 'Milk', 1, 'each', 3, 10) RETURNING id INTO done_milk_id;
  INSERT INTO public.base_list_item_aliases (base_list_id, base_list_item_id, alias_key)
  VALUES (list_id, bread_id, 'loaf');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;

  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, store_id, total_amount)
  VALUES (owner_id, list_id, 'Active trip', 'active', NULL, 10) RETURNING id INTO active_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (active_id, 'Milk', 'milk', FALSE, 1) RETURNING id INTO trip_milk_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (active_id, 'Bread', 'bread', FALSE, 2) RETURNING id INTO trip_bread_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (active_id, 'Unmentioned', 'unmentioned', FALSE, 3) RETURNING id INTO trip_unmentioned_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (active_id, 'Milk duplicate', 'milk', FALSE, 4) RETURNING id INTO trip_duplicate_id;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at, total_amount, store_id)
  VALUES (owner_id, done_list_id, 'Completed trip', 'completed', NOW() - INTERVAL '1 hour', 21, v_store_id) RETURNING id INTO done_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order, price)
  VALUES (done_id, 'Milk', 'milk', TRUE, 1, 10) RETURNING id INTO done_trip_milk_id;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  VALUES (owner_id, other_list_id, 'Old trip', 'completed', NOW() - INTERVAL '3 days') RETURNING id INTO old_id;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  VALUES (owner_id, after_list_id, 'Completed after upload', 'completed', NOW() + INTERVAL '1 hour') RETURNING id INTO after_session_id;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  VALUES (owner_id, occupied_list_id, 'Already has a receipt', 'completed', NOW() - INTERVAL '30 minutes') RETURNING id INTO occupied_session_id;
  RESET ROLE;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status)
  VALUES (other_id, foreign_list_id, 'Foreign trip', 'active') RETURNING id INTO other_session_id;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;

  INSERT INTO public.tickets (user_id, image_path, ocr_status, created_at, total_amount, store_id, store_name)
  VALUES (owner_id, 'verify/active.jpg', 'completed', NOW(), 16.50, v_store_id, 'Verification Market') RETURNING id INTO receipt_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (receipt_id, 'Milk', 1, 'each', 4.25) RETURNING id INTO ticket_milk_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (receipt_id, 'Milk', 1, 'each', 1.25) RETURNING id INTO ticket_milk_extra_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (receipt_id, 'Loaf', 1, 'each', 2) RETURNING id INTO ticket_bread_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (receipt_id, 'Apples', 2, 'each', 3) RETURNING id INTO ticket_apple_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status, created_at, store_name)
  VALUES (owner_id, 'verify/done.jpg', 'completed', NOW(), 'Unmapped Market') RETURNING id INTO done_receipt_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (done_receipt_id, 'Milk', 1, 'each', 8) RETURNING id INTO ticket_done_milk_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (done_receipt_id, 'New completed item', 1, 'each', 2) RETURNING id INTO ticket_done_new_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (done_receipt_id, 'Over limit item', 1, 'each', 1) RETURNING id INTO ticket_done_over_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/second.jpg', 'completed') RETURNING id INTO second_receipt_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/unread.jpg', 'pending') RETURNING id INTO unread_receipt_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status, base_list_id) VALUES (owner_id, 'verify/added.jpg', 'completed', list_id) RETURNING id INTO added_receipt_id;

  -- Candidate window, status, receipt/list state and owner scoping.
  SELECT COUNT(*) INTO n FROM public.ticket_session_candidates(receipt_id);
  INSERT INTO verification_results VALUES ('Candidates include active and all completed trips inside the 48-hour window', n = 4, n::TEXT);
  INSERT INTO verification_results VALUES ('Unread receipts have no candidates', NOT EXISTS (SELECT 1 FROM public.ticket_session_candidates(unread_receipt_id)), 'expected empty');
  INSERT INTO verification_results VALUES ('Receipts already added to a list have no candidates', NOT EXISTS (SELECT 1 FROM public.ticket_session_candidates(added_receipt_id)), 'expected empty');
  INSERT INTO verification_results VALUES ('Another owner’s trips are not candidates', NOT EXISTS (SELECT 1 FROM public.ticket_session_candidates(receipt_id) WHERE id = other_session_id), 'expected absent');
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/occupied.jpg', 'completed') RETURNING id INTO occupied_receipt_id;
  PERFORM set_config('listys.learning', 'on', TRUE);
  UPDATE public.tickets SET shopping_session_id = occupied_session_id WHERE id = occupied_receipt_id;
  PERFORM set_config('listys.learning', 'off', TRUE);
  INSERT INTO verification_results VALUES ('A session with a receipt is not a candidate', NOT EXISTS (SELECT 1 FROM public.ticket_session_candidates(receipt_id) WHERE id = occupied_session_id), 'expected absent');
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/conflict.jpg', 'completed') RETURNING id INTO conflict_receipt_id;

  -- Name, alias, duplicate-name tie breaking, and no-match behavior.
  INSERT INTO verification_results VALUES ('Name match chooses the first duplicate session item',
    (SELECT shopping_session_item_id = trip_milk_id AND match_kind = 'name' FROM public.ticket_session_matches(receipt_id, active_id) WHERE ticket_item_id = ticket_milk_id), trip_milk_id::TEXT);
  INSERT INTO verification_results VALUES ('Alias match resolves through the owner list',
    (SELECT shopping_session_item_id = trip_bread_id AND match_kind = 'alias' FROM public.ticket_session_matches(receipt_id, active_id) WHERE ticket_item_id = ticket_bread_id), trip_bread_id::TEXT);
  INSERT INTO verification_results VALUES ('Unmatched line remains unmatched',
    (SELECT match_kind = 'none' FROM public.ticket_session_matches(receipt_id, active_id) WHERE ticket_item_id = ticket_apple_id), 'none expected');

  -- Active attach: matched lines are checked and priced, chosen unmatched line is added, the rest remain unchecked.
  SELECT * INTO v FROM public.attach_receipt_to_session(receipt_id, active_id, '[]'::JSONB, ARRAY[ticket_apple_id], 18.25, 250);
  INSERT INTO verification_results VALUES ('Active attach completes the trip and adds one chosen line',
    v.completed_now AND v.added_count = 1 AND NOT v.replayed, v.completed_now || '/' || v.added_count || '/' || v.replayed);
  INSERT INTO verification_results VALUES ('Receipt total replaces trip total without rewriting its source',
    (SELECT total_amount = 18.25 FROM public.shopping_sessions WHERE id = active_id)
      AND (SELECT total_amount = 16.50 FROM public.tickets WHERE id = receipt_id), 'trip=18.25 receipt=16.50');
  INSERT INTO verification_results VALUES ('Matched and added session items are checked; unmentioned item stays unchecked',
    (SELECT checked FROM public.shopping_session_items WHERE id = trip_milk_id)
      AND (SELECT checked FROM public.shopping_session_items WHERE id = trip_bread_id)
      AND (SELECT NOT checked FROM public.shopping_session_items WHERE id = trip_unmentioned_id)
      AND EXISTS (SELECT 1 FROM public.shopping_session_items WHERE shopping_session_id = active_id AND normalized_name = 'apples' AND checked), 'checked state');
  SELECT bli.purchase_count, bli.average_price INTO purchase_count, avg_price
  FROM public.base_list_items bli WHERE bli.id = milk_id;
  INSERT INTO verification_results VALUES ('Duplicate receipt lines count as one purchase and sum into average price',
    purchase_count = 1 AND avg_price = 5.50, purchase_count || '/' || avg_price);
  SELECT stats.last_price, stats.last_quantity, stats.last_unit INTO v
  FROM public.base_list_item_store_stats stats WHERE stats.base_list_item_id = milk_id AND stats.store_id = v_store_id;
  INSERT INTO verification_results VALUES ('Store stats capture summed receipt price and quantity context',
    v.last_price = 5.50 AND v.last_quantity = 2 AND v.last_unit = 'each', COALESCE(v.last_price::TEXT, 'null') || '/' || COALESCE(v.last_quantity::TEXT, 'null') || '/' || COALESCE(v.last_unit, 'null'));
  INSERT INTO verification_results VALUES ('Receipt store is applied to an active trip without learning a store alias',
    (SELECT ss.store_id = v_store_id FROM public.shopping_sessions ss WHERE ss.id = active_id)
      AND NOT EXISTS (SELECT 1 FROM public.store_aliases sa WHERE sa.user_id = owner_id AND sa.alias_key = 'unmappedmarket'), 'store assignment');

  -- Replaying is a no-op; conflicting receipt/session pairs report stable conflict reasons.
  SELECT * INTO v FROM public.attach_receipt_to_session(receipt_id, active_id, '[]'::JSONB, ARRAY[ticket_apple_id], 99, 250);
  INSERT INTO verification_results VALUES ('Replay reports true and does not change the total', v.replayed AND (SELECT total_amount = 18.25 FROM public.shopping_sessions WHERE id = active_id), v.replayed::TEXT);
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(receipt_id, done_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('A receipt cannot attach to a second trip', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, det = PG_EXCEPTION_DETAIL;
    INSERT INTO verification_results VALUES ('A receipt cannot attach to a second trip', code = '23505' AND det = 'RECEIPT_ATTACHED', code || '/' || COALESCE(det, ''));
  END;
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(conflict_receipt_id, occupied_session_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('A trip cannot take a second receipt', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, det = PG_EXCEPTION_DETAIL;
    INSERT INTO verification_results VALUES ('A trip cannot take a second receipt', code = '23505' AND det = 'SESSION_HAS_RECEIPT', code || '/' || COALESCE(det, ''));
  END;

  -- Completed attach adjusts an existing average without incrementing its purchase count; new lines count once.
  SELECT * INTO v FROM public.attach_receipt_to_session(done_receipt_id, done_id, '[]'::JSONB, ARRAY[ticket_done_new_id, ticket_done_over_id], NULL, 2);
  SELECT bli.purchase_count, bli.average_price INTO purchase_count, avg_price
  FROM public.base_list_items bli WHERE bli.id = done_milk_id;
  INSERT INTO verification_results VALUES ('Completed attach refines average without a second purchase',
    NOT v.completed_now AND purchase_count = 3 AND ROUND(avg_price, 2) = 9.33, purchase_count || '/' || avg_price);
  SELECT bli.purchase_count INTO n FROM public.base_list_items bli
  WHERE bli.base_list_id = done_list_id AND bli.normalized_name = 'new completed item';
  INSERT INTO verification_results VALUES ('New line on completed attach counts once', n = 1, COALESCE(n::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('Completed attach reports the chosen lines and the line beyond capacity', v.added_count = 2 AND v.over_limit_count = 1, v.added_count || '/' || v.over_limit_count);
  INSERT INTO verification_results VALUES ('Completed trip keeps its prior total when no replacement is supplied',
    (SELECT total_amount = 21 FROM public.shopping_sessions WHERE id = done_id), '21 expected');
  INSERT INTO verification_results VALUES ('Receipt without a store inherits the completed trip store without learning an alias',
    (SELECT t.store_id = v_store_id FROM public.tickets t WHERE t.id = done_receipt_id)
      AND NOT EXISTS (SELECT 1 FROM public.store_aliases sa WHERE sa.user_id = owner_id AND sa.alias_key = 'unmappedmarket'), 'session store inherited');
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(second_receipt_id, old_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('Three-day-old trip is outside the attach window', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS msg = MESSAGE_TEXT, code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Three-day-old trip is outside the attach window', code = 'P0001' AND msg = 'SESSION_OUT_OF_WINDOW', code || '/' || msg);
  END;

  -- The regular receipt merge records the purchase quantity/unit context added by this migration.
  INSERT INTO public.tickets (user_id, image_path, ocr_status, store_id)
  VALUES (owner_id, 'verify/merge.jpg', 'completed', v_store_id) RETURNING id INTO merge_receipt_id;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price)
  VALUES (merge_receipt_id, 'Olive Oil', 2, 'L', 7.5) RETURNING id INTO merge_item_id;
  PERFORM * FROM public.merge_ticket_items_to_base_list(merge_receipt_id, list_id, ARRAY[merge_item_id], 250, NULL);
  INSERT INTO verification_results VALUES ('Normal receipt merge records last quantity and unit',
    EXISTS (
      SELECT 1 FROM public.base_list_items bli
      JOIN public.base_list_item_store_stats stats ON stats.base_list_item_id = bli.id
      WHERE bli.base_list_id = list_id AND bli.normalized_name = 'olive oil'
        AND stats.store_id = v_store_id AND stats.last_quantity = 2 AND stats.last_unit = 'L'
    ), '2 L expected');

  -- The rest of the contract is exercised with isolated fixtures so failed calls cannot pollute successful checks.
  -- A completed trip at another store must not move already-counted purchases.
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at, store_id)
  VALUES (owner_id, other_list_id, 'Different store trip', 'completed', NOW(), v_store_id) RETURNING id INTO other_session_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status, store_id)
  VALUES (owner_id, 'verify/mismatch.jpg', 'completed', other_store_id) RETURNING id INTO second_receipt_id;
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(second_receipt_id, other_session_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('Completed trip with another store rejects the receipt', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS msg = MESSAGE_TEXT, code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Completed trip with another store rejects the receipt', code = 'P0001' AND msg = 'STORE_MISMATCH', code || '/' || msg);
  END;

  -- Direct link changes are blocked. A matching delete uses the FK's single-column SET NULL action.
  PERFORM set_config('listys.learning', 'off', TRUE);
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/direct.jpg', 'completed') RETURNING id INTO second_receipt_id;
  BEGIN
    UPDATE public.tickets SET shopping_session_id = other_session_id WHERE id = second_receipt_id;
    INSERT INTO verification_results VALUES ('Direct receipt/session link writes are rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Direct receipt/session link writes are rejected', code = 'P0001', code);
  END;
  DELETE FROM public.shopping_sessions WHERE id = other_session_id;
  INSERT INTO verification_results VALUES ('Deleting a trip clears only the receipt link',
    (SELECT shopping_session_id IS NULL AND base_list_id IS NULL FROM public.tickets WHERE id = second_receipt_id), 'link cleared');
  BEGIN
    UPDATE public.tickets SET shopping_session_id = NULL WHERE id = receipt_id;
    INSERT INTO verification_results VALUES ('Direct receipt detachment is rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Direct receipt detachment is rejected', code = 'P0001', code);
  END;

  -- Merge after attachment and completion-after-attach are rejected. An attached receipt link is not detachable.
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(receipt_id, list_id, ARRAY[ticket_milk_id], 250, NULL);
    INSERT INTO verification_results VALUES ('Attached receipt cannot be merged to a list', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS msg = MESSAGE_TEXT, code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Attached receipt cannot be merged to a list', code = 'P0001' AND msg = 'RECEIPT_ATTACHED', code || '/' || msg);
  END;
  BEGIN
    PERFORM * FROM public.complete_shopping_session(active_id, NULL, NULL, 250);
    INSERT INTO verification_results VALUES ('Completing an already attached trip is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS msg = MESSAGE_TEXT, code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Completing an already attached trip is rejected', code = 'P0001' AND msg = 'SESSION_NOT_ACTIVE', code || '/' || msg);
  END;

  -- An error after the first line has been processed rolls the whole RPC statement back.
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status)
  VALUES (owner_id, other_list_id, 'Atomic failure trip', 'active') RETURNING id INTO other_session_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (other_session_id, 'Milk', 'milk', FALSE, 1) RETURNING id INTO trip_duplicate_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, checked, sort_order)
  VALUES (other_session_id, 'Bread', 'bread', FALSE, 2) RETURNING id INTO trip_unmentioned_id;
  INSERT INTO public.tickets (user_id, image_path, ocr_status) VALUES (owner_id, 'verify/atomic.jpg', 'completed') RETURNING id INTO added_receipt_id;
  INSERT INTO public.ticket_items (ticket_id, name, price) VALUES (added_receipt_id, 'Milk', 2) RETURNING id INTO ticket_apple_id;
  INSERT INTO public.ticket_items (ticket_id, name, price) VALUES (added_receipt_id, 'Bread', 3) RETURNING id INTO ticket_done_new_id;
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(added_receipt_id, other_session_id,
      jsonb_build_array(jsonb_build_object('ticket_item_id', ticket_apple_id, 'shopping_session_item_id', trip_duplicate_id),
                        jsonb_build_object('ticket_item_id', ticket_done_new_id, 'shopping_session_item_id', trip_duplicate_id)),
      ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('Invalid later link rolls back earlier line changes', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    SELECT checked INTO v FROM public.shopping_session_items WHERE id = trip_duplicate_id;
    INSERT INTO verification_results VALUES ('Invalid later link rolls back earlier line changes', code = '22023' AND v.checked IS FALSE AND (SELECT shopping_session_id IS NULL FROM public.tickets WHERE id = added_receipt_id), code || '/checked=' || COALESCE(v.checked::TEXT, 'null'));
  END;

  -- Ownership checks include a list collaborator: only the receipt/session owner can reconcile.
  INSERT INTO public.list_collaborators (base_list_id, user_id, invited_by) VALUES (list_id, collaborator_id, owner_id);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', collaborator_id, 'role', 'authenticated')::text, TRUE);
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(receipt_id, active_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('Collaborator cannot attach the owner receipt', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Collaborator cannot attach the owner receipt', code = 'P0002', code);
  END;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', other_id, 'role', 'authenticated')::text, TRUE);
  BEGIN
    PERFORM * FROM public.attach_receipt_to_session(receipt_id, active_id, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
    INSERT INTO verification_results VALUES ('Foreign user cannot attach the owner receipt', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('Foreign user cannot attach the owner receipt', code = 'P0002', code);
  END;

  RESET ROLE;
  INSERT INTO verification_results VALUES ('Prior data is outside the rollback fixture', TRUE, 'all inserted rows use synthetic user ids');
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;
ROLLBACK;
