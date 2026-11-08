-- =============================================
-- VERIFICATION: clarify-receipt-review (kept quantities, upload origin, origin-only trip candidates)
-- Covers migration 20261102000000_clarify_receipt_review.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
--   supabase db query --linked -f supabase/verification/clarify-receipt-review.sql
-- Run only against an explicitly approved non-production target after the migration is applied.
-- The last statement returns one row per check; every row must have ok = true.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  v_owner UUID := gen_random_uuid();
  v_other UUID := gen_random_uuid();
  v_group UUID;
  v_list UUID;
  v_list2 UUID;
  v_store UUID;
  v_milk UUID;
  v_rice UUID;
  v_origin_trip UUID;
  v_other_trip UUID;
  v_receipt UUID;
  v_standalone UUID;
  v_line_milk UUID;
  v_line_rice UUID;
  v_line_soap UUID;
  v_quantity NUMERIC;
  v_count INTEGER;
  v_ids UUID[];
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (v_owner, 'authenticated', 'authenticated', v_owner || '@verify.invalid'),
         (v_other, 'authenticated', 'authenticated', v_other || '@verify.invalid');

  INSERT INTO public.groups (user_id, name) VALUES (v_owner, 'Verification') RETURNING id INTO v_group;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (v_group, v_owner, 'Pantry') RETURNING id INTO v_list;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (v_group, v_owner, 'Office') RETURNING id INTO v_list2;
  INSERT INTO public.stores (user_id, name, normalized_name) VALUES (v_owner, 'Verification Market', 'verificationmarket') RETURNING id INTO v_store;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count) VALUES (v_list, 'Milk', 2, 'each', 0) RETURNING id INTO v_milk;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit) VALUES (v_list, 'Rice', NULL, 'kg') RETURNING id INTO v_rice;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;

  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status)
  VALUES (v_owner, v_list, 'Origin trip', 'active') RETURNING id INTO v_origin_trip;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status)
  VALUES (v_owner, v_list2, 'Another trip', 'active') RETURNING id INTO v_other_trip;

  -- 1. Quantity rule: the receipt line neither adds to an existing quantity nor overwrites it.
  INSERT INTO public.tickets (user_id, image_path, ocr_status, store_id)
  VALUES (v_owner, 'verify/quantity.jpg', 'completed', v_store) RETURNING id INTO v_receipt;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price) VALUES (v_receipt, 'Milk', 3, 'each', 4.00) RETURNING id INTO v_line_milk;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price) VALUES (v_receipt, 'Rice', 2, 'kg', 6.00) RETURNING id INTO v_line_rice;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price) VALUES (v_receipt, 'Soap', 3, 'each', 2.00) RETURNING id INTO v_line_soap;

  PERFORM * FROM public.merge_ticket_items_to_base_list(v_receipt, v_list, ARRAY[v_line_milk, v_line_rice, v_line_soap], 250, NULL);

  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE id = v_milk;
  INSERT INTO verification_results VALUES ('1a existing item keeps its quantity', v_quantity = 2, v_quantity::TEXT);

  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE id = v_rice;
  INSERT INTO verification_results VALUES ('1b existing item without quantity takes the line quantity', v_quantity = 2, COALESCE(v_quantity::TEXT, 'null'));

  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'soap';
  INSERT INTO verification_results VALUES ('1c new item takes the line quantity', v_quantity = 3, COALESCE(v_quantity::TEXT, 'null'));

  SELECT purchase_count INTO v_count FROM public.base_list_items WHERE id = v_milk;
  INSERT INTO verification_results VALUES ('1d the update still counts the purchase', v_count = 1, v_count::TEXT);

  INSERT INTO verification_results VALUES ('1e store statistics record the line quantity',
    EXISTS (
      SELECT 1 FROM public.base_list_item_store_stats stats
      WHERE stats.base_list_item_id = v_milk AND stats.store_id = v_store AND stats.last_quantity = 3
    ), 'last_quantity 3 expected');

  -- 2. Candidates: none without an origin, only the origin with one.
  INSERT INTO public.tickets (user_id, image_path, ocr_status)
  VALUES (v_owner, 'verify/standalone.jpg', 'completed') RETURNING id INTO v_standalone;
  SELECT COUNT(*) INTO v_count FROM public.ticket_session_candidates(v_standalone);
  INSERT INTO verification_results VALUES ('2a a receipt without origin has no candidates', v_count = 0, v_count::TEXT);

  INSERT INTO public.tickets (user_id, image_path, ocr_status, uploaded_from_session_id)
  VALUES (v_owner, 'verify/origin.jpg', 'completed', v_origin_trip) RETURNING id INTO v_receipt;
  SELECT array_agg(id) INTO v_ids FROM public.ticket_session_candidates(v_receipt);
  INSERT INTO verification_results VALUES ('2b a receipt with origin offers only that trip',
    v_ids = ARRAY[v_origin_trip], COALESCE(v_ids::TEXT, 'none'));

  -- 3. The database refuses an origin that is not the owner's session.
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_other, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO public.tickets (user_id, image_path, ocr_status, uploaded_from_session_id)
    VALUES (v_other, 'verify/foreign.jpg', 'completed', v_origin_trip);
    INSERT INTO verification_results VALUES ('3 another user cannot point a receipt at this trip', FALSE, 'accepted');
  EXCEPTION WHEN foreign_key_violation THEN
    INSERT INTO verification_results VALUES ('3 another user cannot point a receipt at this trip', TRUE, 'foreign_key_violation');
  END;

  -- 4. Deleting the origin trip keeps the receipt and clears only the origin.
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;
  DELETE FROM public.shopping_sessions WHERE id = v_origin_trip;
  INSERT INTO verification_results VALUES ('4 deleting the trip clears the origin and keeps the receipt',
    (SELECT uploaded_from_session_id IS NULL FROM public.tickets WHERE id = v_receipt), 'origin cleared');
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
