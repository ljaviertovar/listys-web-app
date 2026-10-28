-- =============================================
-- VERIFICATION: store tags and scoped sessions (PRD v3 Phase 3 follow-on)
-- Covers migration 20261027000000_store_tags_and_scoped_sessions.sql
-- =============================================
-- One rollback-only transaction. All users, stores, lists, tickets, sessions and items are synthetic and are removed
-- by the final ROLLBACK. Run only against an approved writable test database after applying the migration:
--   supabase db query --linked -f supabase/verification/store-tags-and-scoped-sessions.sql
-- Every result row before ROLLBACK must have ok = true. This script has not been run; no database target is approved.
-- The two temporary fault triggers prove statement-level transaction rollback paths and are rolled back with the test.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

-- Failure injection is transaction-local and used only by the forced-error checks below.
CREATE FUNCTION public.verify_fail_session_item_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('listys.verify_fail_session_item', TRUE) = 'on' THEN
    RAISE EXCEPTION 'forced verification failure' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER verify_fail_session_item_insert
  BEFORE INSERT ON public.shopping_session_items
  FOR EACH ROW EXECUTE FUNCTION public.verify_fail_session_item_insert();

CREATE FUNCTION public.verify_fail_source_store_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('listys.verify_fail_store_delete', TRUE) = 'on' THEN
    RAISE EXCEPTION 'forced verification failure' USING ERRCODE = 'P0001';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER verify_fail_source_store_delete
  BEFORE DELETE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.verify_fail_source_store_delete();

DO $$
DECLARE
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  g1 UUID;
  l1 UUID;
  l2 UUID;
  l3 UUID;
  l_empty UUID;
  i_repeat UUID;
  i_tie UUID;
  i_old UUID;
  i_low UUID;
  i_usual UUID;
  i_bought UUID;
  i_other UUID;
  i_untagged UUID;
  i_merge UUID;
  i_threshold UUID;
  purchase_no INTEGER;
  s_a UUID;
  s_b UUID;
  s_c UUID;
  s_foreign UUID;
  ss UUID;
  ss_whole UUID;
  ss_old UUID;
  t UUID;
  n INTEGER;
  cnt INTEGER;
  v_id UUID;
  v_store UUID;
  v_source_exists BOOLEAN;
  v_session_store UUID;
  v_price NUMERIC;
  v_price_at TIMESTAMPTZ;
  v_usual_source TEXT;
  err TEXT;
  code TEXT;
  det TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid'),
         (u3, 'authenticated', 'authenticated', u3 || '@verify.invalid');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, TRUE);
  SET LOCAL ROLE authenticated;

  INSERT INTO public.groups (user_id, name) VALUES (u1, 'Verification') RETURNING id INTO g1;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Pantry') RETURNING id INTO l1;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Weekly') RETURNING id INTO l2;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Merge verification') RETURNING id INTO l3;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Empty') RETURNING id INTO l_empty;
  s_a := (public.create_store('Store A', 50)).id;
  s_b := (public.create_store('Store B', 50)).id;
  s_c := (public.create_store('Store C', 50)).id;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, TRUE);
  s_foreign := (public.create_store('Foreign Store', 50)).id;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, TRUE);
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l1, 'Repeat item', 1, 0) RETURNING id INTO i_repeat;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l1, 'Tie item', 1, 1) RETURNING id INTO i_tie;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l1, 'Old habit', 1, 2) RETURNING id INTO i_old;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l1, 'Low evidence', 1, 3) RETURNING id INTO i_low;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l2, 'Usual here', 1, 0) RETURNING id INTO i_usual;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l2, 'Bought here once', 1, 1) RETURNING id INTO i_bought;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l2, 'Usual elsewhere', 1, 2) RETURNING id INTO i_other;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l2, 'No store history', 1, 3) RETURNING id INTO i_untagged;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l3, 'Merge stats', 1, 4) RETURNING id INTO i_merge;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order)
  VALUES (l3, 'Merge threshold', 1, 5) RETURNING id INTO i_threshold;

  -- 1. Completion learns store-specific evidence and sets an automatic usual store on purchase three.
  FOR purchase_no IN 1..3 LOOP
    SELECT (public.start_shopping_session(l1, 'Store A trip', s_a)).id INTO ss;
    UPDATE public.shopping_session_items SET checked = TRUE, price = 4.25
      WHERE shopping_session_id = ss AND normalized_name = 'repeat item';
    PERFORM * FROM public.complete_shopping_session(ss, NULL, NULL, 250);
    SELECT purchase_count INTO cnt FROM public.base_list_item_store_stats
      WHERE base_list_item_id = i_repeat AND store_id = s_a;
    INSERT INTO verification_results VALUES (
      '01.' || purchase_no || ' completed purchase increments per-store statistics', cnt = purchase_no, COALESCE(cnt::TEXT, 'null'));
  END LOOP;
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_repeat;
  INSERT INTO verification_results VALUES ('01d third purchase chooses automatic usual store', v_store = s_a, COALESCE(v_store::TEXT, 'null'));
  SELECT usual_store_source INTO v_usual_source FROM public.base_list_items WHERE id = i_repeat;
  INSERT INTO verification_results VALUES ('01e learned tag is marked automatic', v_usual_source = 'auto', COALESCE(v_usual_source, 'null'));

  INSERT INTO public.tickets (user_id, image_path, store_id, store_name)
  VALUES (u1, 'verify/store-learning.jpg', s_a, 'Store A') RETURNING id INTO t;
  INSERT INTO public.ticket_items (ticket_id, name, quantity, price)
  VALUES (t, 'Repeat item', 1, 5.25) RETURNING id INTO v_id;
  PERFORM * FROM public.merge_ticket_items_to_base_list(t, l1, ARRAY[v_id], 250, NULL);
  SELECT purchase_count INTO cnt FROM public.base_list_item_store_stats
    WHERE base_list_item_id = i_repeat AND store_id = s_a;
  INSERT INTO verification_results VALUES ('01f confirmed receipt merge contributes purchase evidence', cnt = 4, cnt::TEXT);

  -- 2. Threshold, deterministic tie, 180-day window, manual freeze and clear-to-auto.
  PERFORM set_config('listys.learning', 'on', TRUE);
  INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, purchase_count, last_purchased_at)
  VALUES
    (u1, i_tie, s_a, 3, now() - interval '1 day'),
    (u1, i_tie, s_b, 3, now() - interval '1 day'),
    (u1, i_old, s_a, 3, now() - interval '200 days'),
    (u1, i_old, s_b, 3, now() - interval '10 days'),
    (u1, i_low, s_a, 2, now() - interval '1 day');
  PERFORM public.recompute_usual_store(ARRAY[i_tie, i_old, i_low]);
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_tie;
  INSERT INTO verification_results VALUES ('02a equal evidence breaks ties by store id', v_store = LEAST(s_a, s_b), COALESCE(v_store::TEXT, 'null'));
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_old;
  INSERT INTO verification_results VALUES ('02b evidence older than 180 days is excluded', v_store = s_b, COALESCE(v_store::TEXT, 'null'));
  UPDATE public.base_list_item_store_stats SET purchase_count = 4, last_purchased_at = now()
    WHERE base_list_item_id = i_old AND store_id = s_a;
  PERFORM public.recompute_usual_store(ARRAY[i_old]);
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_old;
  INSERT INTO verification_results VALUES ('02b1 a new purchase can change the automatic usual store', v_store = s_a, COALESCE(v_store::TEXT, 'null'));
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_low;
  INSERT INTO verification_results VALUES ('02c fewer than three purchases does not set a tag', v_store IS NULL, COALESCE(v_store::TEXT, 'null'));

  PERFORM public.set_item_usual_store(i_repeat, s_b);
  PERFORM set_config('listys.learning', 'on', TRUE);
  UPDATE public.base_list_item_store_stats SET purchase_count = 5, last_purchased_at = now()
    WHERE base_list_item_id = i_repeat AND store_id = s_a;
  PERFORM public.recompute_usual_store(ARRAY[i_repeat]);
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_repeat;
  INSERT INTO verification_results VALUES ('02d later learning preserves a manual tag', v_store = s_b, COALESCE(v_store::TEXT, 'null'));
  PERFORM public.set_item_usual_store(i_repeat, NULL);
  SELECT usual_store_id, usual_store_source INTO v_store, v_usual_source FROM public.base_list_items WHERE id = i_repeat;
  INSERT INTO verification_results VALUES ('02e clearing a manual tag returns to automatic evidence', v_store = s_a AND v_usual_source = 'auto', COALESCE(v_store::TEXT, 'null') || '/' || v_usual_source);
  PERFORM public.set_item_usual_store(i_untagged, s_c);
  PERFORM public.set_item_usual_store(i_untagged, NULL);
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_untagged;
  INSERT INTO verification_results VALUES ('02f clearing without evidence leaves no tag', v_store IS NULL, COALESCE(v_store::TEXT, 'null'));

  PERFORM set_config('listys.learning', 'off', TRUE);
  BEGIN
    UPDATE public.base_list_items SET usual_store_id = s_b WHERE id = i_repeat;
    INSERT INTO verification_results VALUES ('02g direct owner tag write is rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02g direct owner tag write is rejected', code = '42501', code);
  END;
  BEGIN
    UPDATE public.base_list_items SET usual_store_source = 'manual' WHERE id = i_repeat;
    INSERT INTO verification_results VALUES ('02g1 direct owner source write is rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02g1 direct owner source write is rejected', code = '42501', code);
  END;
  PERFORM set_config('listys.learning', 'off', TRUE);
  BEGIN
    PERFORM public.recompute_usual_store(ARRAY[i_repeat]);
    INSERT INTO verification_results VALUES ('02h direct recompute without transaction context is rejected', FALSE, 'call succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02h direct recompute without transaction context is rejected', code = '42501', code);
  END;
  PERFORM set_config('listys.learning', 'off', TRUE);
  BEGIN
    INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, last_purchased_at)
    VALUES (u1, i_untagged, s_c, now());
    INSERT INTO verification_results VALUES ('02i direct owner statistics write is rejected', FALSE, 'insert succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02i direct owner statistics write is rejected', code = '42501', code);
  END;
  BEGIN
    UPDATE public.base_list_item_store_stats SET purchase_count = purchase_count + 1
      WHERE base_list_item_id = i_repeat AND store_id = s_a;
    INSERT INTO verification_results VALUES ('02i1 direct owner statistics update is rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02i1 direct owner statistics update is rejected', code = '42501', code);
  END;

  -- 3. Store-scoped flags distinguish usual, purchased-once, other-store and untagged items.
  PERFORM set_config('listys.learning', 'on', TRUE);
  UPDATE public.base_list_items SET usual_store_id = s_a, usual_store_source = 'manual' WHERE id = i_usual;
  INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, purchase_count, last_purchased_at)
  VALUES (u1, i_bought, s_a, 1, now()), (u1, i_other, s_b, 3, now());
  PERFORM public.set_item_usual_store(i_other, s_b);
  SELECT (public.start_shopping_session(l2, 'Scoped trip', s_a)).id INTO ss;
  SELECT COUNT(*) INTO n FROM public.shopping_session_items WHERE shopping_session_id = ss AND is_other_store = FALSE;
  SELECT COUNT(*) INTO cnt FROM public.shopping_session_items WHERE shopping_session_id = ss AND is_other_store = TRUE;
  INSERT INTO verification_results VALUES ('03a usual and purchased-once items go first; other and untagged stay available', n = 2 AND cnt = 2, n::TEXT || '/' || cnt::TEXT);
  SELECT is_other_store INTO v_source_exists FROM public.shopping_session_items WHERE shopping_session_id = ss AND name = 'Usual here';
  INSERT INTO verification_results VALUES ('03b usual-store item is in the store section', v_source_exists = FALSE, v_source_exists::TEXT);
  SELECT is_other_store INTO v_source_exists FROM public.shopping_session_items WHERE shopping_session_id = ss AND name = 'No store history';
  INSERT INTO verification_results VALUES ('03c untagged item is marked other-store', v_source_exists = TRUE, v_source_exists::TEXT);
  BEGIN
    PERFORM public.start_shopping_session(l2, 'Duplicate trip', s_a);
    INSERT INTO verification_results VALUES ('03d second session on one list returns 23505 and active id', FALSE, 'no error');
  EXCEPTION WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, det = PG_EXCEPTION_DETAIL, err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('03d second session on one list returns 23505 and active id', code = '23505' AND err = 'SESSION_ALREADY_ACTIVE' AND det = ss::TEXT, code || '/' || err || '/' || COALESCE(det, 'null'));
  END;

  PERFORM set_config('listys.learning', 'off', TRUE);
  BEGIN
    PERFORM public.set_item_usual_store(i_repeat, s_foreign);
    INSERT INTO verification_results VALUES ('02j foreign store cannot be set as usual store', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('02j foreign store cannot be set as usual store', code = 'P0002', code);
  END;
  PERFORM public.start_shopping_session(l1, 'Different list trip', NULL);
  SELECT id INTO ss_whole FROM public.shopping_sessions WHERE base_list_id = l1 AND status = 'active';
  SELECT bool_and(NOT is_other_store) INTO v_source_exists FROM public.shopping_session_items WHERE shopping_session_id = ss_whole;
  INSERT INTO verification_results VALUES ('03e whole-list session leaves every item in the first section', v_source_exists, COALESCE(v_source_exists::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('03e two different lists can be active together',
    (SELECT COUNT(*) FROM public.shopping_sessions WHERE user_id = u1 AND status = 'active') = 2, 'active sessions on separate lists');
  BEGIN
    PERFORM public.start_shopping_session(l_empty, 'Empty trip', NULL);
    INSERT INTO verification_results VALUES ('03f empty list is rejected with LIST_EMPTY', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE, err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('03f empty list is rejected with LIST_EMPTY', code = 'P0001' AND err = 'LIST_EMPTY', code || '/' || err);
  END;
  PERFORM * FROM public.complete_shopping_session(
    (SELECT id FROM public.shopping_sessions WHERE base_list_id = l1 AND status = 'active'), NULL, NULL, 250
  );
  PERFORM * FROM public.complete_shopping_session(ss, NULL, NULL, 250);

  BEGIN
    PERFORM public.start_shopping_session(l1, 'Foreign store', s_foreign);
    INSERT INTO verification_results VALUES ('03g foreign store cannot scope a session', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('03g foreign store cannot scope a session', code = 'P0002', code);
  END;

  -- 4. Forced failures leave no partial session and store merge rolls back all its preceding writes.
  INSERT INTO public.base_list_items (base_list_id, name, quantity) VALUES (l_empty, 'Failure target', 1);
  PERFORM set_config('listys.verify_fail_session_item', 'on', TRUE);
  BEGIN
    PERFORM public.start_shopping_session(l_empty, 'Forced failure', NULL);
    INSERT INTO verification_results VALUES ('04a injected start failure is reported', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('04a injected start failure is reported', code = 'P0001', code);
  END;
  PERFORM set_config('listys.verify_fail_session_item', 'off', TRUE);
  SELECT COUNT(*) INTO n FROM public.shopping_sessions WHERE base_list_id = l_empty AND status = 'active';
  INSERT INTO verification_results VALUES ('04b failed start created no session', n = 0, n::TEXT);

  PERFORM set_config('listys.learning', 'on', TRUE);
  INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, purchase_count, last_purchased_at, last_price, last_price_at)
  VALUES
    (u1, i_merge, s_a, 2, now() - interval '2 days', 10, now() - interval '2 days'),
    (u1, i_merge, s_b, 2, now() - interval '1 day', 12, now() - interval '1 day'),
    (u1, i_threshold, s_a, 2, now() - interval '2 days', 3, now() - interval '2 days'),
    (u1, i_threshold, s_b, 1, now() - interval '1 day', 4, now() - interval '1 day');
  PERFORM public.set_item_usual_store(i_merge, s_b);
  PERFORM public.set_item_usual_store(i_threshold, NULL);
  SELECT (public.start_shopping_session(l3, 'Session to move', s_b)).id INTO ss;
  PERFORM set_config('listys.verify_fail_store_delete', 'on', TRUE);
  BEGIN
    PERFORM public.merge_stores(s_a, s_b);
    INSERT INTO verification_results VALUES ('04c forced store merge failure is reported', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('04c forced store merge failure is reported', code = 'P0001', code);
  END;
  PERFORM set_config('listys.verify_fail_store_delete', 'off', TRUE);
  SELECT EXISTS (SELECT 1 FROM public.stores WHERE id = s_b) INTO v_source_exists;
  SELECT store_id INTO v_session_store FROM public.shopping_sessions WHERE id = ss;
  SELECT purchase_count INTO cnt FROM public.base_list_item_store_stats WHERE base_list_item_id = i_merge AND store_id = s_a;
  INSERT INTO verification_results VALUES ('04d failed store merge rolled back session move and stats', v_source_exists AND v_session_store = s_b AND cnt = 2, v_source_exists::TEXT || '/' || v_session_store::TEXT || '/' || cnt::TEXT);

  PERFORM public.merge_stores(s_a, s_b);
  SELECT purchase_count, last_price, last_price_at INTO cnt, v_price, v_price_at
    FROM public.base_list_item_store_stats WHERE base_list_item_id = i_merge AND store_id = s_a;
  INSERT INTO verification_results VALUES ('04e merge sums stats and keeps latest price and date', cnt = 4 AND v_price = 12 AND v_price_at >= now() - interval '2 days', cnt::TEXT || '/' || v_price::TEXT || '/' || v_price_at::TEXT);
  SELECT usual_store_id, usual_store_source INTO v_store, v_usual_source FROM public.base_list_items WHERE id = i_merge;
  INSERT INTO verification_results VALUES ('04f manual tag follows merged store and stays manual', v_store = s_a AND v_usual_source = 'manual', COALESCE(v_store::TEXT, 'null') || '/' || v_usual_source);
  SELECT usual_store_id INTO v_store FROM public.base_list_items WHERE id = i_threshold;
  INSERT INTO verification_results VALUES ('04g merged evidence reaching three purchases sets automatic tag', v_store = s_a, COALESCE(v_store::TEXT, 'null'));
  SELECT store_id INTO v_session_store FROM public.shopping_sessions WHERE id = ss;
  INSERT INTO verification_results VALUES ('04h active scoped session moves to target store', v_session_store = s_a, COALESCE(v_session_store::TEXT, 'null'));
  INSERT INTO verification_results VALUES ('04i source store is removed after successful merge', NOT EXISTS (SELECT 1 FROM public.stores WHERE id = s_b), 'source row absent');

  -- 5. Collaborator read/write isolation and owner cascade behavior.
  INSERT INTO public.list_collaborators (base_list_id, user_id, invited_by) VALUES (l1, u2, u1);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, TRUE);
  SELECT COUNT(*) INTO n FROM public.base_list_item_store_stats WHERE base_list_item_id = i_repeat;
  INSERT INTO verification_results VALUES ('05a collaborator reads no owner statistics', n = 0, n::TEXT);
  BEGIN
    PERFORM public.set_item_usual_store(i_repeat, s_a);
    INSERT INTO verification_results VALUES ('05b collaborator cannot set usual store', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('05b collaborator cannot set usual store', code = 'P0002', code);
  END;
  BEGIN
    PERFORM public.start_shopping_session(l1, 'Collaborator trip', NULL);
    INSERT INTO verification_results VALUES ('05b collaborator cannot start a session on the owner''s list', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('05b collaborator cannot start a session on the owner''s list', code = 'P0002', code);
  END;
  BEGIN
    UPDATE public.base_list_items SET usual_store_id = s_a WHERE id = i_repeat;
    INSERT INTO verification_results VALUES ('05c collaborator direct tag write is rejected', FALSE, 'update succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('05c collaborator direct tag write is rejected', code = '42501', code);
  END;
  BEGIN
    INSERT INTO public.base_list_item_store_stats (user_id, base_list_item_id, store_id, last_purchased_at)
    VALUES (u1, i_repeat, s_a, now());
    INSERT INTO verification_results VALUES ('05d collaborator direct statistics write is rejected', FALSE, 'insert succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('05d collaborator direct statistics write is rejected', code = '42501', code);
  END;

  -- 6. Anonymous RPCs are rejected; all data is synthetic and the pre-existing history stays unchanged.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, TRUE);
  RESET ROLE;
  SET LOCAL ROLE authenticated;
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  VALUES (u1, l_empty, 'Prior history', 'completed', now() - interval '1 year') RETURNING id INTO ss_old;
  PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, TRUE);
  RESET ROLE;
  SET LOCAL ROLE anon;
  BEGIN
    PERFORM public.start_shopping_session(l1, 'Anonymous', NULL);
    INSERT INTO verification_results VALUES ('06a anonymous session start is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06a anonymous session start is rejected', code <> '00000', code);
  END;
  BEGIN
    PERFORM public.recompute_usual_store(ARRAY[i_repeat]);
    INSERT INTO verification_results VALUES ('06a1 anon cannot execute recompute RPC', FALSE, 'call succeeded');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS code = RETURNED_SQLSTATE;
    INSERT INTO verification_results VALUES ('06a1 anon cannot execute recompute RPC', code = '42501', code);
  END;
  RESET ROLE;
  SELECT COUNT(*) INTO n FROM public.shopping_sessions WHERE id = ss_old AND status = 'completed' AND store_id IS NULL;
  INSERT INTO verification_results VALUES ('06b prior completed history remains untouched', n = 1, n::TEXT);
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;
ROLLBACK;
