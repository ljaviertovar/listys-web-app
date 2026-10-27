-- =============================================
-- VERIFICATION: stores foundation (PRD v3 Phase 3)
-- Covers migration 20261025000000_stores_foundation.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
-- Run it only against a database you are allowed to write to inside a transaction, e.g.:
--   supabase db query --linked -f supabase/verification/stores-foundation.sql
-- The last statement returns one row per check; every row must have ok = true.
--
-- Not covered here: truly concurrent calls (create_store/rename_store serialize on an advisory lock per user, and the
-- unique indexes are the final guard), and the Edge Functions (store extraction is tested with Vitest).

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid(); -- owner of stores, receipts and a list
  u2 UUID := gen_random_uuid(); -- another user (RLS, foreign ids)
  s_nf UUID;
  s_dollarama UUID;
  s_metro UUID;
  s_fb UUID;
  s_saver UUID;
  s_superc UUID;
  s_other UUID;
  s_tmp UUID;
  s_u2 UUID;
  g1 UUID;
  l1 UUID;
  l2 UUID;
  i_milk UUID;
  i_bread UUID;
  i_eggs UUID;
  i_other_list UUID;
  t1 UUID;
  t2 UUID;
  t3 UUID;
  t4 UUID;
  t5 UUID;
  t6 UUID;
  t_u2 UUID;
  ti_milk_es UUID;
  ti_bread UUID;
  ti_new UUID;
  ti_new2 UUID;
  ti_far UUID;
  v_store public.stores;
  v_ticket public.tickets;
  r RECORD;
  n INTEGER;
  m INTEGER;
  k TEXT;
  err TEXT;
  code TEXT;
  det TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid');

  -- 1. normalization -----------------------------------------------------------------------------------------------
  INSERT INTO verification_results VALUES ('01a "No Frills" -> nofrills', public.normalize_store_name('No Frills') = 'nofrills', public.normalize_store_name('No Frills'));
  INSERT INTO verification_results VALUES ('01b "NOFRILLS" -> nofrills', public.normalize_store_name('NOFRILLS') = 'nofrills', public.normalize_store_name('NOFRILLS'));
  INSERT INTO verification_results VALUES ('01c "no frills #123" -> nofrills', public.normalize_store_name('no frills #123') = 'nofrills', public.normalize_store_name('no frills #123'));
  INSERT INTO verification_results VALUES ('01d "No Frills 3127" -> nofrills', public.normalize_store_name('No Frills 3127') = 'nofrills', public.normalize_store_name('No Frills 3127'));
  INSERT INTO verification_results VALUES ('01e accents and punctuation ignored', public.normalize_store_name('Épicerie  Ñ-Market!') = 'epicerienmarket', public.normalize_store_name('Épicerie  Ñ-Market!'));
  INSERT INTO verification_results VALUES ('01f "Dollar Tree" <> "Dollarama"', public.normalize_store_name('Dollar Tree') <> public.normalize_store_name('Dollarama'), public.normalize_store_name('Dollar Tree'));
  INSERT INTO verification_results VALUES ('01g "#123" alone has no key', public.normalize_store_name('#123') IS NULL, COALESCE(public.normalize_store_name('#123'), 'null'));
  INSERT INTO verification_results VALUES ('01h short trailing number is kept', public.normalize_store_name('Shop 24') = 'shop24', public.normalize_store_name('Shop 24'));

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  -- 2. create_store ------------------------------------------------------------------------------------------------
  v_store := public.create_store('  No   Frills ', 50);
  s_nf := v_store.id;
  INSERT INTO verification_results VALUES ('02a create trims and collapses the name', v_store.name = 'No Frills' AND v_store.normalized_name = 'nofrills', v_store.name);
  SELECT COUNT(*) INTO n FROM public.store_aliases WHERE store_id = s_nf AND alias_key = 'nofrills';
  INSERT INTO verification_results VALUES ('02b create stores its own key as an alias', n = 1, n::TEXT);
  INSERT INTO verification_results VALUES ('02c timestamps set', v_store.created_at IS NOT NULL AND v_store.updated_at IS NOT NULL, v_store.created_at::TEXT);

  BEGIN
    PERFORM public.create_store('no-frills', 50);
    INSERT INTO verification_results VALUES ('02d duplicate key rejected with 23505 and the existing id', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, det = PG_EXCEPTION_DETAIL;
    INSERT INTO verification_results VALUES ('02d duplicate key rejected with 23505 and the existing id', code = '23505' AND det = s_nf::TEXT, code || ' ' || COALESCE(det, ''));
  END;

  BEGIN
    PERFORM public.create_store('#123', 50);
    INSERT INTO verification_results VALUES ('02e name without a key rejected with 22023', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02e name without a key rejected with 22023', code = '22023', code);
  END;

  BEGIN
    PERFORM public.create_store(repeat('x', 101), 50);
    INSERT INTO verification_results VALUES ('02f name over 100 characters rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02f name over 100 characters rejected', code = '22023', code);
  END;

  s_dollarama := (public.create_store('Dollarama', 50)).id;
  BEGIN
    PERFORM public.create_store('Dollar Tree', 2);
    INSERT INTO verification_results VALUES ('02g limit reached is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02g limit reached is rejected', code = 'P0001' AND err LIKE 'Store limit reached%', err);
  END;

  -- 3. rename_store ------------------------------------------------------------------------------------------------
  s_metro := (public.create_store('Grocery Store', 50)).id;
  v_store := public.rename_store(s_metro, 'Metro');
  INSERT INTO verification_results VALUES ('03a rename changes name and key', v_store.name = 'Metro' AND v_store.normalized_name = 'metro', v_store.name);
  INSERT INTO verification_results VALUES ('03b the old name still resolves', public.resolve_store('Grocery Store') = s_metro, COALESCE(public.resolve_store('Grocery Store')::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('03c the new name resolves', public.resolve_store('METRO') = s_metro, COALESCE(public.resolve_store('METRO')::TEXT, 'null'));

  s_tmp := (public.create_store('NF', 50)).id;
  BEGIN
    PERFORM public.rename_store(s_tmp, 'No Frills');
    INSERT INTO verification_results VALUES ('03d rename onto another store is rejected with its id', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, det = PG_EXCEPTION_DETAIL;
    INSERT INTO verification_results VALUES ('03d rename onto another store is rejected with its id', code = '23505' AND det = s_nf::TEXT, code || ' ' || COALESCE(det, ''));
  END;
  SELECT name INTO k FROM public.stores WHERE id = s_tmp;
  INSERT INTO verification_results VALUES ('03e failed rename changes nothing', k = 'NF', k);

  v_store := public.rename_store(s_tmp, 'nf');
  INSERT INTO verification_results VALUES ('03f renaming to its own key with another case works', v_store.name = 'nf', v_store.name);

  -- 4. resolve + assign_ticket_store -------------------------------------------------------------------------------
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/1.jpg', 'NOFRILLS #3127') RETURNING id INTO t1;
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/2.jpg', 'NF Bloor St') RETURNING id INTO t2;
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/3.jpg', 'Metro') RETURNING id INTO t3;
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/4.jpg', NULL) RETURNING id INTO t4;

  INSERT INTO verification_results VALUES ('04a raw name resolves to the matching store', public.resolve_store('NOFRILLS #3127') = s_nf, COALESCE(public.resolve_store('NOFRILLS #3127')::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('04b unknown raw name resolves to nothing', public.resolve_store('NF Bloor St') IS NULL, 'null expected');
  INSERT INTO verification_results VALUES ('04c null raw name resolves to nothing', public.resolve_store(NULL) IS NULL, 'null expected');

  v_ticket := public.assign_ticket_store(t2, s_nf);
  INSERT INTO verification_results VALUES ('04d assign sets store_id', v_ticket.store_id = s_nf, v_ticket.store_id::TEXT);
  INSERT INTO verification_results VALUES ('04e assign teaches the raw name', public.resolve_store('nf bloor st') = s_nf, COALESCE(public.resolve_store('nf bloor st')::TEXT, 'null'));

  -- re-point a non-canonical alias: "SuperCee" became an alias of Super Saver, then the user picks Super C
  -- ("superc" itself is Super C's own key, so the test uses a raw name that is nobody's own name)
  s_saver := (public.create_store('Super Saver', 50)).id;
  s_superc := (public.create_store('Super C', 50)).id;
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/5.jpg', 'SuperCee') RETURNING id INTO t5;
  PERFORM public.assign_ticket_store(t5, s_saver);
  INSERT INTO verification_results VALUES ('04f alias learned for the first store', public.resolve_store('SuperCee') = s_saver, COALESCE(public.resolve_store('SuperCee')::TEXT, 'null'));
  INSERT INTO public.tickets (user_id, image_path, store_name) VALUES (u1, 'x/6.jpg', 'SuperCee') RETURNING id INTO t6;
  PERFORM public.assign_ticket_store(t6, s_superc);
  INSERT INTO verification_results VALUES ('04g the latest explicit choice re-points the alias', public.resolve_store('SuperCee') = s_superc, COALESCE(public.resolve_store('SuperCee')::TEXT, 'null'));
  SELECT store_id INTO s_other FROM public.tickets WHERE id = t5;
  INSERT INTO verification_results VALUES ('04h receipts already assigned do not change', s_other = s_saver, s_other::TEXT);

  -- another store's own name is never taken
  s_fb := (public.create_store('Food Basics', 50)).id;
  PERFORM public.assign_ticket_store(t3, s_fb);
  INSERT INTO verification_results VALUES ('04i another store keeps its own name', public.resolve_store('Metro') = s_metro, COALESCE(public.resolve_store('Metro')::TEXT, 'null'));
  SELECT store_id INTO s_other FROM public.tickets WHERE id = t3;
  INSERT INTO verification_results VALUES ('04j but the receipt is assigned as asked', s_other = s_fb, s_other::TEXT);

  -- receipt without a raw name can still get a store; clearing keeps the store
  PERFORM public.assign_ticket_store(t4, s_metro);
  v_ticket := public.assign_ticket_store(t4, NULL);
  SELECT COUNT(*) INTO n FROM public.stores WHERE id = s_metro;
  INSERT INTO verification_results VALUES ('04k clearing removes the store from the receipt only', v_ticket.store_id IS NULL AND n = 1, n::TEXT);

  -- 5. merge_stores ------------------------------------------------------------------------------------------------
  s_tmp := (public.create_store('NOFRILLS Junction', 50)).id;
  UPDATE public.tickets SET store_name = 'NOFRILLS Junction' WHERE id = t1;
  PERFORM public.assign_ticket_store(t1, s_tmp);
  v_store := public.merge_stores(s_nf, s_tmp);
  SELECT COUNT(*) INTO n FROM public.tickets WHERE store_id = s_nf;
  INSERT INTO verification_results VALUES ('05a merge moves the receipts', n = 2, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.stores WHERE id = s_tmp;
  INSERT INTO verification_results VALUES ('05b the source store is gone', n = 0, n::TEXT);
  INSERT INTO verification_results VALUES ('05c the source name resolves to the target', public.resolve_store('nofrills junction') = s_nf, COALESCE(public.resolve_store('nofrills junction')::TEXT, 'null'));
  SELECT COUNT(*) INTO n FROM public.tickets WHERE user_id = u1 AND store_id IS NULL AND id IN (t1, t2);
  INSERT INTO verification_results VALUES ('05d no receipt lost its store', n = 0, n::TEXT);

  BEGIN
    PERFORM public.merge_stores(s_nf, s_nf);
    INSERT INTO verification_results VALUES ('05e merge into itself is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('05e merge into itself is rejected', code = '22023', code);
  END;

  -- 6. RLS and ownership -------------------------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  SELECT COUNT(*) INTO n FROM public.stores WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('06a another user cannot read the stores', n = 0, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.store_aliases WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('06b another user cannot read the store aliases', n = 0, n::TEXT);
  INSERT INTO verification_results VALUES ('06c another user does not resolve them', public.resolve_store('No Frills') IS NULL, 'null expected');

  s_u2 := (public.create_store('No Frills', 50)).id;
  INSERT INTO verification_results VALUES ('06d the same name is free for another user', s_u2 IS NOT NULL AND s_u2 <> s_nf, s_u2::TEXT);

  BEGIN
    PERFORM public.rename_store(s_nf, 'Hijack');
    INSERT INTO verification_results VALUES ('06e renaming a foreign store is not found', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06e renaming a foreign store is not found', code = 'P0002', code);
  END;

  BEGIN
    PERFORM public.merge_stores(s_u2, s_nf);
    INSERT INTO verification_results VALUES ('06f merging a foreign store is not found', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06f merging a foreign store is not found', code = 'P0002', code);
  END;

  INSERT INTO public.tickets (user_id, image_path) VALUES (u2, 'y/1.jpg') RETURNING id INTO t_u2;
  BEGIN
    PERFORM public.assign_ticket_store(t_u2, s_nf);
    INSERT INTO verification_results VALUES ('06g assigning a foreign store is not found', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06g assigning a foreign store is not found', code = 'P0002', code);
  END;

  BEGIN
    UPDATE public.tickets SET store_id = s_nf WHERE id = t_u2;
    INSERT INTO verification_results VALUES ('06h the FK rejects a receipt pointing at a foreign store', FALSE, 'no error');
  EXCEPTION WHEN foreign_key_violation THEN
    INSERT INTO verification_results VALUES ('06h the FK rejects a receipt pointing at a foreign store', TRUE, 'foreign_key_violation');
  END;

  BEGIN
    PERFORM public.assign_ticket_store(t1, s_u2);
    INSERT INTO verification_results VALUES ('06i a foreign receipt is not found', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06i a foreign receipt is not found', code = 'P0002', code);
  END;

  -- 7. item matching and the linked merge --------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  INSERT INTO public.groups (user_id, name) VALUES (u1, 'G') RETURNING id INTO g1;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Pantry') RETURNING id INTO l1;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Office') RETURNING id INTO l2;
  INSERT INTO public.base_list_items (base_list_id, name, quantity) VALUES (l1, '2% Milk 4L', 1) RETURNING id INTO i_milk;
  INSERT INTO public.base_list_items (base_list_id, name, quantity) VALUES (l1, 'Bread', 1) RETURNING id INTO i_bread;
  INSERT INTO public.base_list_items (base_list_id, name, quantity) VALUES (l1, 'Eggs', 1) RETURNING id INTO i_eggs;
  INSERT INTO public.base_list_items (base_list_id, name, quantity) VALUES (l2, '2% Milk 4L', 1) RETURNING id INTO i_other_list;

  INSERT INTO public.tickets (user_id, image_path) VALUES (u1, 'x/7.jpg') RETURNING id INTO t1;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, price) VALUES (t1, 'LECHE 2% 4L', 1, 5.00) RETURNING id INTO ti_milk_es;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, price) VALUES (t1, 'BREAD', 1, 3.00) RETURNING id INTO ti_bread;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, price) VALUES (t1, 'Apples', 1, 4.00) RETURNING id INTO ti_new;

  SELECT match_kind INTO k FROM public.ticket_item_matches(t1, l1) WHERE ticket_item_id = ti_bread;
  INSERT INTO verification_results VALUES ('07a same name matches by name', k = 'name', k);
  SELECT match_kind INTO k FROM public.ticket_item_matches(t1, l1) WHERE ticket_item_id = ti_milk_es;
  INSERT INTO verification_results VALUES ('07b different name is new', k = 'none', k);

  -- invalid links are rejected before anything is written
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(t1, l1, ARRAY[ti_milk_es, ti_bread, ti_new], 250,
      jsonb_build_array(jsonb_build_object('ticket_item_id', ti_milk_es, 'base_list_item_id', i_other_list)));
    INSERT INTO verification_results VALUES ('07c link to another list''s item rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('07c link to another list''s item rejected', code = '22023', code);
  END;
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(t1, l1, ARRAY[ti_milk_es, ti_bread, ti_new], 250,
      jsonb_build_array(jsonb_build_object('ticket_item_id', ti_bread, 'base_list_item_id', i_eggs)));
    INSERT INTO verification_results VALUES ('07d name-matched line cannot be linked', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('07d name-matched line cannot be linked', code = '22023', code);
  END;
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(t1, l1, ARRAY[ti_bread], 250,
      jsonb_build_array(jsonb_build_object('ticket_item_id', ti_milk_es, 'base_list_item_id', i_milk)));
    INSERT INTO verification_results VALUES ('07e link for an unselected line rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('07e link for an unselected line rejected', code = '22023', code);
  END;
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = l1;
  INSERT INTO verification_results VALUES ('07f rejected merges wrote nothing', n = 3, n::TEXT);

  -- the limit counts only inserts: 3 items + 1 new (Apples) fits in 4, the linked milk does not count
  SELECT * INTO r FROM public.merge_ticket_items_to_base_list(t1, l1, ARRAY[ti_milk_es, ti_bread, ti_new], 4,
    jsonb_build_array(jsonb_build_object('ticket_item_id', ti_milk_es, 'base_list_item_id', i_milk)));
  INSERT INTO verification_results VALUES ('07g counts: 1 added, 2 updated, within a limit of 4', r.new_count = 1 AND r.updated_count = 2 AND r.skipped_count = 0, r.new_count || '/' || r.updated_count || '/' || r.skipped_count);
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = l1 AND normalized_name = public.normalize_item_name('LECHE 2% 4L');
  INSERT INTO verification_results VALUES ('07h the linked line created no item', n = 0, n::TEXT);
  SELECT purchase_count INTO n FROM public.base_list_items WHERE id = i_milk;
  INSERT INTO verification_results VALUES ('07i the linked item counted a purchase', n = 2, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_item_aliases WHERE base_list_id = l1 AND base_list_item_id = i_milk;
  INSERT INTO verification_results VALUES ('07j the link is remembered as an alias', n = 1, n::TEXT);

  -- next receipt: the alias applies; other lists are unaffected
  INSERT INTO public.tickets (user_id, image_path) VALUES (u1, 'x/8.jpg') RETURNING id INTO t2;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, price) VALUES (t2, 'Leche 2% 4L', 1, 6.00) RETURNING id INTO ti_new2;
  SELECT match_kind INTO k FROM public.ticket_item_matches(t2, l1) WHERE ticket_item_id = ti_new2;
  INSERT INTO verification_results VALUES ('07k the alias is proposed on the next receipt', k = 'alias', k);
  SELECT match_kind INTO k FROM public.ticket_item_matches(t2, l2) WHERE ticket_item_id = ti_new2;
  INSERT INTO verification_results VALUES ('07l the alias belongs to its list only', k = 'none', k);

  -- the alias applies on merge, and the limit is not charged for it
  SELECT * INTO r FROM public.merge_ticket_items_to_base_list(t2, l1, ARRAY[ti_new2], 4, NULL);
  INSERT INTO verification_results VALUES ('07m the alias updates the remembered item', r.new_count = 0 AND r.updated_count = 1, r.new_count || '/' || r.updated_count);

  -- undo: a null link adds the line as new and forgets the alias
  INSERT INTO public.tickets (user_id, image_path) VALUES (u1, 'x/9.jpg') RETURNING id INTO t3;
  INSERT INTO public.ticket_items (ticket_id, name, quantity) VALUES (t3, 'LECHE 2% 4L', 1) RETURNING id INTO ti_far;
  SELECT * INTO r FROM public.merge_ticket_items_to_base_list(t3, l1, ARRAY[ti_far], 250,
    jsonb_build_array(jsonb_build_object('ticket_item_id', ti_far, 'base_list_item_id', NULL)));
  SELECT COUNT(*) INTO n FROM public.base_list_item_aliases WHERE base_list_id = l1;
  INSERT INTO verification_results VALUES ('07n a null link adds a new item and forgets the alias', r.new_count = 1 AND n = 0, r.new_count || ' new, ' || n || ' aliases');

  -- re-link: an alias moves to the newly chosen item
  INSERT INTO public.tickets (user_id, image_path) VALUES (u1, 'x/10.jpg') RETURNING id INTO t4;
  INSERT INTO public.ticket_items (ticket_id, name, quantity) VALUES (t4, 'HUEVOS', 1) RETURNING id INTO ti_far;
  PERFORM * FROM public.merge_ticket_items_to_base_list(t4, l1, ARRAY[ti_far], 250,
    jsonb_build_array(jsonb_build_object('ticket_item_id', ti_far, 'base_list_item_id', i_bread)));
  PERFORM * FROM public.merge_ticket_items_to_base_list(t4, l1, ARRAY[ti_far], 250,
    jsonb_build_array(jsonb_build_object('ticket_item_id', ti_far, 'base_list_item_id', i_eggs)));
  SELECT base_list_item_id INTO s_other FROM public.base_list_item_aliases WHERE base_list_id = l1 AND alias_key = public.normalize_item_name('HUEVOS');
  INSERT INTO verification_results VALUES ('07o re-linking moves the alias to the chosen item', s_other = i_eggs, COALESCE(s_other::TEXT, 'null'));

  -- name match wins over an alias: an alias equal to another item's name is never applied
  INSERT INTO public.base_list_item_aliases (base_list_id, base_list_item_id, alias_key) VALUES (l1, i_milk, 'bread');
  SELECT match_kind, base_list_item_id INTO k, s_other FROM public.ticket_item_matches(t1, l1) WHERE ticket_item_id = ti_bread;
  INSERT INTO verification_results VALUES ('07p name match wins over an alias', k = 'name' AND s_other = i_bread, k);
  DELETE FROM public.base_list_item_aliases WHERE alias_key = 'bread';

  -- deleting an item deletes its aliases
  SELECT COUNT(*) INTO n FROM public.base_list_item_aliases WHERE base_list_item_id = i_eggs;
  DELETE FROM public.base_list_items WHERE id = i_eggs;
  SELECT COUNT(*) INTO m FROM public.base_list_item_aliases WHERE base_list_item_id = i_eggs;
  INSERT INTO verification_results VALUES ('07q deleting an item deletes its aliases', n = 1 AND m = 0, n || ' -> ' || m);

  -- a rejected merge writes nothing, not even the alias of its linked line (the function is one statement, so any
  -- error raised after writes rolls them back as well)
  INSERT INTO public.tickets (user_id, image_path) VALUES (u1, 'x/11.jpg') RETURNING id INTO t4;
  INSERT INTO public.ticket_items (ticket_id, name, quantity) VALUES (t4, 'Pan Blanco', 1) RETURNING id INTO ti_far;
  INSERT INTO public.ticket_items (ticket_id, name, quantity) VALUES (t4, 'Brand New Thing', 1) RETURNING id INTO ti_new;
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = l1;
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(t4, l1, ARRAY[ti_far, ti_new], n,
      jsonb_build_array(jsonb_build_object('ticket_item_id', ti_far, 'base_list_item_id', i_bread)));
    INSERT INTO verification_results VALUES ('07r over the limit is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('07r over the limit is rejected', err LIKE 'Cannot merge items.%', err);
  END;
  SELECT COUNT(*) INTO n FROM public.base_list_item_aliases WHERE alias_key = public.normalize_item_name('Pan Blanco');
  INSERT INTO verification_results VALUES ('07s nothing from the failed merge remains', n = 0, n::TEXT);

  -- a merge without links behaves as before
  SELECT * INTO r FROM public.merge_ticket_items_to_base_list(t4, l1, ARRAY[ti_new], 250);
  INSERT INTO verification_results VALUES ('07t merge without links still adds new items', r.new_count = 1, r.new_count::TEXT);

  -- another user cannot match or merge into this list, nor read its aliases (which exist: the owner sees one)
  PERFORM * FROM public.merge_ticket_items_to_base_list(t4, l1, ARRAY[ti_far], 250,
    jsonb_build_array(jsonb_build_object('ticket_item_id', ti_far, 'base_list_item_id', i_bread)));
  SELECT COUNT(*) INTO m FROM public.base_list_item_aliases WHERE base_list_id = l1;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  SELECT COUNT(*) INTO n FROM public.base_list_item_aliases WHERE base_list_id = l1;
  INSERT INTO verification_results VALUES ('07u another user cannot read item aliases', m >= 1 AND n = 0, m || ' for the owner, ' || n || ' for the other user');
  BEGIN
    PERFORM * FROM public.ticket_item_matches(t1, l1);
    INSERT INTO verification_results VALUES ('07v another user cannot read matches', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('07v another user cannot read matches', code = 'P0002', code);
  END;
  BEGIN
    PERFORM * FROM public.merge_ticket_items_to_base_list(t_u2, l1, NULL, 250);
    INSERT INTO verification_results VALUES ('07w merging into a foreign list is not found', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('07w merging into a foreign list is not found', code = 'P0002', code);
  END;

  -- 8. no identity -> error
  PERFORM set_config('request.jwt.claims', '{}', true);
  BEGIN
    PERFORM public.create_store('Anon', 50);
    INSERT INTO verification_results VALUES ('08 anonymous call is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO verification_results VALUES ('08 anonymous call is rejected', SQLERRM = 'Unauthorized', SQLERRM);
  END;

  RESET ROLE;
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
