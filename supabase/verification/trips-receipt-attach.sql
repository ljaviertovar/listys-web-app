-- =============================================
-- VERIFICATION: trips-and-receipt-attach (no attach window, purchased quantity replaces the usual one)
-- Covers migration 20261103000000_trips_receipt_attach.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
--   supabase db query --linked -f supabase/verification/trips-receipt-attach.sql
-- Run only against an explicitly approved non-production target after the migration is applied.
-- The last statement returns one row per check; every row must have ok = true.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  v_owner UUID := gen_random_uuid();
  v_group UUID;
  v_pantry UUID;
  v_office UUID;
  v_active UUID;
  v_old UUID;
  v_receipt UUID;
  v_old_receipt UUID;
  v_origin_receipt UUID;
  v_office_milk UUID;
  v_trip_milk UUID;
  v_trip_eggs UUID;
  v_trip_butter UUID;
  v_trip_bread UUID;
  v_trip_apples UUID;
  v_trip_towels UUID;
  v_old_trip_milk UUID;
  v_quantity NUMERIC;
  v_unit TEXT;
  v_count INTEGER;
  v_ids UUID[];
  v RECORD;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (v_owner, 'authenticated', 'authenticated', v_owner || '@verify.invalid');

  INSERT INTO public.groups (user_id, name) VALUES (v_owner, 'Verification') RETURNING id INTO v_group;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (v_group, v_owner, 'Pantry') RETURNING id INTO v_pantry;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (v_group, v_owner, 'Office') RETURNING id INTO v_office;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count) VALUES
    (v_pantry, 'Milk', 2, 'each', 0), (v_pantry, 'Eggs', 2, 'each', 0), (v_pantry, 'Butter', 4, 'each', 0),
    (v_pantry, 'Bread', 1, 'each', 0), (v_pantry, 'Apples', 1, 'each', 0);
  INSERT INTO public.base_list_items (base_list_id, name, quantity, unit, purchase_count)
  VALUES (v_office, 'Milk', 2, 'each', 1) RETURNING id INTO v_office_milk;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;

  -- An active trip planned with the usual quantities, and a trip completed ten days ago (far outside the old window).
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status)
  VALUES (v_owner, v_pantry, 'Active trip', 'active') RETURNING id INTO v_active;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Milk', 'milk', 2, 'each', FALSE, 1) RETURNING id INTO v_trip_milk;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Eggs', 'eggs', 2, 'each', FALSE, 2) RETURNING id INTO v_trip_eggs;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Butter', 'butter', 4, 'each', FALSE, 3) RETURNING id INTO v_trip_butter;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Bread', 'bread', 1, 'each', FALSE, 4) RETURNING id INTO v_trip_bread;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Apples', 'apples', 1, 'each', FALSE, 5) RETURNING id INTO v_trip_apples;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_active, 'Paper towels', 'paper towels', 4, 'each', TRUE, 6) RETURNING id INTO v_trip_towels;

  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  VALUES (v_owner, v_office, 'Old trip', 'completed', NOW() - INTERVAL '10 days') RETURNING id INTO v_old;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, normalized_name, quantity, unit, checked, sort_order)
  VALUES (v_old, 'Milk', 'milk', 2, 'each', TRUE, 1) RETURNING id INTO v_old_trip_milk;

  -- 1. Candidates: a trip completed ten days before the upload is still offered to the receipt uploaded from it.
  INSERT INTO public.tickets (user_id, image_path, ocr_status, uploaded_from_session_id)
  VALUES (v_owner, 'verify/origin.jpg', 'completed', v_old) RETURNING id INTO v_origin_receipt;
  SELECT array_agg(id) INTO v_ids FROM public.ticket_session_candidates(v_origin_receipt);
  INSERT INTO verification_results VALUES ('1 an old completed origin trip is still a candidate',
    v_ids = ARRAY[v_old], COALESCE(v_ids::TEXT, 'none'));

  -- 2. Active trip completed by the receipt: lines are more than, less than, summed over, or mixed against the usual quantity.
  INSERT INTO public.tickets (user_id, image_path, ocr_status)
  VALUES (v_owner, 'verify/active.jpg', 'completed') RETURNING id INTO v_receipt;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price) VALUES
    (v_receipt, 'Milk', 3, 'each', 4.00),
    (v_receipt, 'Eggs', 1, 'each', 3.00),
    (v_receipt, 'Butter', 1, 'each', 5.00),
    (v_receipt, 'Butter', 1, 'each', 5.00),
    (v_receipt, 'Bread', 2, 'each', 2.50),
    (v_receipt, 'Apples', 1, 'kg', 3.00),
    (v_receipt, 'Apples', 1, 'each', 1.00);

  SELECT * INTO v FROM public.attach_receipt_to_session(v_receipt, v_active, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
  INSERT INTO verification_results VALUES ('2a the receipt completes the active trip', v.completed_now AND NOT v.replayed, v.completed_now::TEXT);

  SELECT quantity INTO v_quantity FROM public.shopping_session_items WHERE id = v_trip_milk;
  INSERT INTO verification_results VALUES ('2b bought more than usual: the trip item takes 3, not 5', v_quantity = 3, COALESCE(v_quantity::TEXT, 'null'));
  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'milk';
  INSERT INTO verification_results VALUES ('2c bought more than usual: the list item takes 3', v_quantity = 3, COALESCE(v_quantity::TEXT, 'null'));

  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'eggs';
  INSERT INTO verification_results VALUES ('2d bought less than usual: the list item takes 1', v_quantity = 1, COALESCE(v_quantity::TEXT, 'null'));

  SELECT quantity INTO v_quantity FROM public.shopping_session_items WHERE id = v_trip_butter;
  INSERT INTO verification_results VALUES ('2e two lines of one item are summed', v_quantity = 2, COALESCE(v_quantity::TEXT, 'null'));
  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'butter';
  INSERT INTO verification_results VALUES ('2f two lines of one item are summed in the list too', v_quantity = 2, COALESCE(v_quantity::TEXT, 'null'));

  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'bread';
  INSERT INTO verification_results VALUES ('2g the quantity bought replaces a smaller usual one', v_quantity = 2, COALESCE(v_quantity::TEXT, 'null'));

  SELECT quantity, unit INTO v_quantity, v_unit FROM public.shopping_session_items WHERE id = v_trip_apples;
  INSERT INTO verification_results VALUES ('2h mixed units leave the trip item as planned', v_quantity = 1 AND v_unit = 'each', COALESCE(v_quantity::TEXT, 'null') || '/' || COALESCE(v_unit, 'null'));
  SELECT quantity, unit INTO v_quantity, v_unit FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'apples';
  INSERT INTO verification_results VALUES ('2i mixed units leave the list item as it was', v_quantity = 1 AND v_unit = 'each', COALESCE(v_quantity::TEXT, 'null') || '/' || COALESCE(v_unit, 'null'));

  SELECT quantity INTO v_quantity FROM public.shopping_session_items WHERE id = v_trip_towels;
  INSERT INTO verification_results VALUES ('2j a checked item no line covers keeps its trip quantity', v_quantity = 4, COALESCE(v_quantity::TEXT, 'null'));
  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'paper towels';
  INSERT INTO verification_results VALUES ('2k a checked item no line covers keeps its quantity in the list', v_quantity = 4, COALESCE(v_quantity::TEXT, 'null'));

  SELECT purchase_count INTO v_count FROM public.base_list_items WHERE base_list_id = v_pantry AND normalized_name = 'milk';
  INSERT INTO verification_results VALUES ('2l the active trip counts the purchase once', v_count = 1, COALESCE(v_count::TEXT, 'null'));

  -- 3. Completed trip from ten days ago takes a receipt: quantities and prices update, no second purchase is counted.
  INSERT INTO public.tickets (user_id, image_path, ocr_status)
  VALUES (v_owner, 'verify/old.jpg', 'completed') RETURNING id INTO v_old_receipt;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, unit, price) VALUES (v_old_receipt, 'Milk', 3, 'each', 4.50);

  SELECT * INTO v FROM public.attach_receipt_to_session(v_old_receipt, v_old, '[]'::JSONB, ARRAY[]::UUID[], NULL, 250);
  INSERT INTO verification_results VALUES ('3a a trip completed ten days ago accepts the receipt', NOT v.completed_now AND NOT v.replayed, v.completed_now::TEXT);
  SELECT quantity INTO v_quantity FROM public.shopping_session_items WHERE id = v_old_trip_milk;
  INSERT INTO verification_results VALUES ('3b the old trip item takes the quantity bought', v_quantity = 3, COALESCE(v_quantity::TEXT, 'null'));
  SELECT quantity INTO v_quantity FROM public.base_list_items WHERE id = v_office_milk;
  INSERT INTO verification_results VALUES ('3c the list item takes the quantity bought', v_quantity = 3, COALESCE(v_quantity::TEXT, 'null'));
  SELECT purchase_count INTO v_count FROM public.base_list_items WHERE id = v_office_milk;
  INSERT INTO verification_results VALUES ('3d no second purchase is counted', v_count = 1, COALESCE(v_count::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('3e the old trip receives the receipt price',
    (SELECT price = 4.50 FROM public.shopping_session_items WHERE id = v_old_trip_milk), 'price 4.50 expected');
END;
$$;


-- Multi-receipt checks use isolated synthetic records and are rolled back with the earlier checks.
DO $$
DECLARE
  owner_id UUID := gen_random_uuid(); list_id UUID; group_id UUID; trip_id UUID; milk_id UUID;
  store_a UUID; store_b UUID; receipt_a UUID; receipt_b UUID; receipt_duplicate UUID;
  line_a UUID; line_b UUID; summary RECORD; conflict_detail TEXT; conflict_seen BOOLEAN := FALSE;
BEGIN
  RESET ROLE;
  INSERT INTO auth.users(id,aud,role,email) VALUES(owner_id,'authenticated','authenticated',owner_id || '@verify.invalid');
  INSERT INTO public.groups(user_id,name) VALUES(owner_id,'Multi receipt verification') RETURNING id INTO group_id;
  INSERT INTO public.base_lists(user_id,group_id,name) VALUES(owner_id,group_id,'Multi receipt list') RETURNING id INTO list_id;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',owner_id,'role','authenticated')::TEXT,TRUE);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.stores(user_id,name,normalized_name) VALUES(owner_id,'No Frills','no frills') RETURNING id INTO store_a;
  INSERT INTO public.stores(user_id,name,normalized_name) VALUES(owner_id,'Costco','costco') RETURNING id INTO store_b;
  INSERT INTO public.base_list_items(base_list_id,name,quantity,unit,purchase_count)
    VALUES(list_id,'Milk',1,'each',0);
  INSERT INTO public.shopping_sessions(user_id,base_list_id,name,store_id)
    VALUES(owner_id,list_id,'Two stores',store_a) RETURNING id INTO trip_id;
  INSERT INTO public.shopping_session_items(shopping_session_id,name,normalized_name,quantity,unit)
    VALUES(trip_id,'Milk','milk',1,'each') RETURNING id INTO milk_id;
  INSERT INTO public.tickets(user_id,image_path,ocr_status,uploaded_from_session_id,store_id,total_amount)
    VALUES(owner_id,'verify/multi-a.jpg','completed',trip_id,store_a,86.40) RETURNING id INTO receipt_a;
  INSERT INTO public.ticket_items(ticket_id,name,quantity,unit,price)
    VALUES(receipt_a,'Milk',2,'each',4.49) RETURNING id INTO line_a;
  SELECT * INTO summary FROM public.attach_receipt_to_session(receipt_a,trip_id,'[]',ARRAY[]::UUID[],86.40,250,FALSE);
  INSERT INTO verification_results VALUES ('4a attach without completing stays shopping',
    NOT summary.completed_now AND (SELECT status='active' FROM public.shopping_sessions WHERE id=trip_id),'active expected');
  INSERT INTO verification_results VALUES ('4b line destination is persisted',
    (SELECT shopping_session_item_id=milk_id FROM public.ticket_items WHERE id=line_a),'milk target expected');
  INSERT INTO verification_results VALUES ('4c shopping attachment does not count list purchases yet',
    (SELECT purchase_count=0 FROM public.base_list_items WHERE base_list_id=list_id AND normalized_name='milk'),'0 expected');
  SELECT * INTO summary FROM public.attach_receipt_to_session(receipt_a,trip_id,'[]',ARRAY[]::UUID[],86.40,250,TRUE);
  INSERT INTO verification_results VALUES ('4d replay cannot complete the trip',
    summary.replayed AND (SELECT status='active' FROM public.shopping_sessions WHERE id=trip_id),'replayed and active expected');
  INSERT INTO public.tickets(user_id,image_path,ocr_status,uploaded_from_session_id,store_id,total_amount)
    VALUES(owner_id,'verify/multi-b.jpg','completed',trip_id,store_b,41.12) RETURNING id INTO receipt_b;
  INSERT INTO public.ticket_items(ticket_id,name,quantity,unit,price)
    VALUES(receipt_b,'Milk',1,'each',3.99) RETURNING id INTO line_b;
  INSERT INTO verification_results VALUES ('4e another store remains a candidate',
    EXISTS(SELECT 1 FROM public.ticket_session_candidates(receipt_b) WHERE id=trip_id),'candidate expected');
  SELECT * INTO summary FROM public.attach_receipt_to_session(receipt_b,trip_id,'[]',ARRAY[]::UUID[],41.12,250,TRUE);
  INSERT INTO verification_results VALUES ('4f second store adds its total',
    (SELECT total_amount=127.52 AND status='completed' FROM public.shopping_sessions WHERE id=trip_id),'127.52 expected');
  INSERT INTO verification_results VALUES ('4g same item sums both receipt prices and quantities',
    (SELECT price=8.48 AND quantity=3 FROM public.shopping_session_items WHERE id=milk_id),'8.48 / 3 expected');
  INSERT INTO verification_results VALUES ('4h completion counts the item only once',
    (SELECT purchase_count=1 FROM public.base_list_items WHERE base_list_id=list_id AND normalized_name='milk'),'1 expected');
  INSERT INTO verification_results VALUES ('4i statistics belong to each receipt store',
    (SELECT COUNT(*)=2 AND SUM(stats.last_price)=8.48 AND SUM(stats.purchase_count)=2
      FROM public.base_list_item_store_stats stats JOIN public.base_list_items bli ON bli.id=stats.base_list_item_id
      WHERE bli.base_list_id=list_id),'2 store purchases / 8.48 expected');
  INSERT INTO public.tickets(user_id,image_path,ocr_status,uploaded_from_session_id,store_id)
    VALUES(owner_id,'verify/multi-duplicate.jpg','completed',trip_id,store_b) RETURNING id INTO receipt_duplicate;
  BEGIN
    PERFORM public.attach_receipt_to_session(receipt_duplicate,trip_id,'[]',ARRAY[]::UUID[],5,250,TRUE);
  EXCEPTION WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS conflict_detail = PG_EXCEPTION_DETAIL;
    conflict_seen := conflict_detail = 'SESSION_HAS_STORE_RECEIPT';
  END;
  INSERT INTO verification_results VALUES ('4j second receipt from same store is rejected',conflict_seen,'store conflict expected');
  DELETE FROM public.tickets WHERE id=receipt_b;
  INSERT INTO verification_results VALUES ('4k deleting one receipt recalculates total',
    (SELECT total_amount=86.40 FROM public.shopping_sessions WHERE id=trip_id),'86.40 expected');
  INSERT INTO verification_results VALUES ('4l deleting a receipt preserves item prices',
    (SELECT price=8.48 FROM public.shopping_session_items WHERE id=milk_id),'8.48 expected');
  DELETE FROM public.tickets WHERE id=receipt_a;
  INSERT INTO verification_results VALUES ('4m deleting last receipt keeps last total',
    (SELECT total_amount=86.40 FROM public.shopping_sessions WHERE id=trip_id),'86.40 expected');
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
