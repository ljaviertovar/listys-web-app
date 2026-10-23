-- =============================================
-- VERIFICATION: default Pantry + atomic session completion (PRD v3 Phase 1)
-- Covers migration 20261023000000_pantry_defaults_and_session_completion.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
-- Run it only against a database you are allowed to write to inside a transaction, e.g.:
--   supabase db query --linked -f supabase/verification/pantry-and-session-completion.sql
-- The last statement returns one row per check; every row must have ok = true.
--
-- Not covered here: two simultaneous first calls cannot be raced inside a single transaction. That guarantee is the
-- partial unique index uq_groups_one_default_per_user; check 4 proves the losing path (index conflict -> no second list).

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  g2 UUID;
  l2 UUID;
  v_list UUID;
  v_session UUID;
  v_session2 UUID;
  v_session3 UUID;
  r BOOLEAN;
  n INTEGER;
  summary RECORD;
  err TEXT;
  pc INTEGER;
  pc_unchecked INTEGER;

BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid'),
         (u3, 'authenticated', 'authenticated', u3 || '@verify.invalid');

  -- ---------------------------------------------------------------- Pantry
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  -- 1. first call creates exactly one default group and one Pantry list
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1 AND is_default;
  INSERT INTO verification_results VALUES ('1a first call returns true', r IS TRUE, r::TEXT);
  INSERT INTO verification_results VALUES ('1b exactly one default group', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1 AND name = 'Pantry';
  INSERT INTO verification_results VALUES ('1c exactly one Pantry list', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_items bli JOIN public.base_lists bl ON bl.id = bli.base_list_id WHERE bl.user_id = u1;
  INSERT INTO verification_results VALUES ('1d Pantry starts empty', n = 0, n::TEXT);

  -- 2. repeating the call creates nothing
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2a repeat returns false', r IS FALSE, r::TEXT);
  INSERT INTO verification_results VALUES ('2b still one group', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2c still one list', n = 1, n::TEXT);

  -- 3. deleting the Pantry does not recreate it (the default group is the marker)
  DELETE FROM public.base_lists WHERE user_id = u1;
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('3a no recreation after delete returns false', r IS FALSE, r::TEXT);
  INSERT INTO verification_results VALUES ('3b no list after delete', n = 0, n::TEXT);

  -- 4. losing path of the race: a default group already exists but the user owns no list -> no second group or list
  --    (same state a concurrent winner leaves behind)
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1 AND is_default;
  INSERT INTO verification_results VALUES ('4 still exactly one default group', n = 1, n::TEXT);
  BEGIN
    INSERT INTO public.groups (user_id, name, is_default) VALUES (u1, 'Second default', TRUE);
    INSERT INTO verification_results VALUES ('4b unique index rejects a second default group', FALSE, 'insert succeeded');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO verification_results VALUES ('4b unique index rejects a second default group', TRUE, 'unique_violation');
  END;

  -- 5. an account that already owns a list is untouched
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  INSERT INTO public.groups (user_id, name) VALUES (u2, 'Existing group') RETURNING id INTO g2;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g2, u2, 'Existing list') RETURNING id INTO l2;
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u2;
  INSERT INTO verification_results VALUES ('5a account with a list returns false', r IS FALSE, r::TEXT);
  INSERT INTO verification_results VALUES ('5b no group added', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u2;
  INSERT INTO verification_results VALUES ('5c no list added', n = 1, n::TEXT);

  -- 6. RLS: u2 cannot see u1's default group
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('6 other user cannot read the default group', n = 0, n::TEXT);

  -- 7. no identity -> error
  PERFORM set_config('request.jwt.claims', '{}', true);
  BEGIN
    PERFORM public.ensure_default_pantry('My Lists', 'Pantry');
    INSERT INTO verification_results VALUES ('7 anonymous call is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO verification_results VALUES ('7 anonymous call is rejected', SQLERRM = 'Unauthorized', SQLERRM);
  END;

  -- ---------------------------------------------------------------- Completion (as u3, who owns a list with items)
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  INSERT INTO public.groups (user_id, name) VALUES (u3, 'G3') RETURNING id INTO g2;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g2, u3, 'L3') RETURNING id INTO v_list;
  INSERT INTO public.base_list_items (base_list_id, name, quantity, sort_order, normalized_name)
  VALUES (v_list, 'Milk', 1, 0, 'milk'), (v_list, 'Bread', 1, 1, 'bread'), (v_list, 'Eggs', 1, 2, 'eggs');

  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status) VALUES (u3, v_list, 'Trip', 'active') RETURNING id INTO v_session;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, quantity, checked, sort_order, price)
  VALUES (v_session, 'Milk', 2, TRUE, 0, 3.00),
         (v_session, 'Bread', 1, TRUE, 1, NULL),
         (v_session, 'Eggs', 1, FALSE, 2, NULL),
         (v_session, 'Brand New', 1, TRUE, 3, 5.00),
         (v_session, 'milk', 1, TRUE, 4, NULL);   -- same normalized name as Milk: one purchase per trip

  SELECT purchase_count INTO pc_unchecked FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'eggs';
  SELECT * INTO summary FROM public.complete_shopping_session(v_session, 99.5, 'notes', 250);

  INSERT INTO verification_results VALUES ('8a summary counts', summary.new_count = 1 AND summary.updated_count = 2 AND summary.skipped_count = 0 AND summary.over_limit_count = 0,
    summary.new_count || '/' || summary.updated_count || '/' || summary.skipped_count || '/' || summary.over_limit_count);

  SELECT COUNT(*) INTO n FROM public.shopping_sessions WHERE id = v_session AND status = 'completed' AND completed_at IS NOT NULL
    AND total_amount = 99.5 AND general_notes = 'notes' AND sync_to_base = TRUE;
  INSERT INTO verification_results VALUES ('8b session completed with total, notes and sync flag', n = 1, n::TEXT);

  SELECT purchase_count INTO pc FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'milk';
  INSERT INTO verification_results VALUES ('8c one purchase per distinct name (milk 1 -> 2, not 3)', pc = 2, pc::TEXT);
  SELECT purchase_count INTO pc FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'eggs';
  INSERT INTO verification_results VALUES ('8d unchecked item untouched', pc = pc_unchecked, pc::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'brand new' AND purchase_count = 1 AND average_price = 5.00;
  INSERT INTO verification_results VALUES ('8e new checked item added with initial enrichment', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'milk' AND average_price IS NOT DISTINCT FROM 3.00;
  INSERT INTO verification_results VALUES ('8f average price follows the formula for a first priced purchase', n = 1, n::TEXT);

  -- 9. completing twice fails without effects
  BEGIN
    PERFORM public.complete_shopping_session(v_session);
    INSERT INTO verification_results VALUES ('9a second completion is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('9a second completion is rejected', err = 'SESSION_NOT_ACTIVE', err);
  END;
  SELECT purchase_count INTO pc FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'milk';
  INSERT INTO verification_results VALUES ('9b purchase count unchanged by the rejected call', pc = 2, pc::TEXT);

  -- 10. a full list never blocks completion: limit 4 with 4 items leaves no room for a new checked item
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status) VALUES (u3, v_list, 'Trip 2', 'active') RETURNING id INTO v_session2;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, quantity, checked, sort_order)
  VALUES (v_session2, 'Milk', 1, TRUE, 0), (v_session2, 'Another New Item', 1, TRUE, 1);
  SELECT * INTO summary FROM public.complete_shopping_session(v_session2, NULL, NULL, 4);
  INSERT INTO verification_results VALUES ('10a over-limit counts', summary.new_count = 0 AND summary.updated_count = 1 AND summary.skipped_count = 1 AND summary.over_limit_count = 1,
    summary.new_count || '/' || summary.updated_count || '/' || summary.skipped_count || '/' || summary.over_limit_count);
  SELECT COUNT(*) INTO n FROM public.shopping_sessions WHERE id = v_session2 AND status = 'completed';
  INSERT INTO verification_results VALUES ('10b session still completed', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_list_items WHERE base_list_id = v_list AND normalized_name = 'another new item';
  INSERT INTO verification_results VALUES ('10c the item that did not fit was not added', n = 0, n::TEXT);

  -- 11. another user's session is reported as not found
  INSERT INTO public.shopping_sessions (user_id, base_list_id, name, status) VALUES (u3, v_list, 'Trip 3', 'active') RETURNING id INTO v_session3;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  BEGIN
    PERFORM public.complete_shopping_session(v_session3);
    INSERT INTO verification_results VALUES ('11a other user cannot complete', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('11a other user cannot complete', err = 'SESSION_NOT_FOUND', err);
  END;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  SELECT COUNT(*) INTO n FROM public.shopping_sessions WHERE id = v_session3 AND status = 'active';
  INSERT INTO verification_results VALUES ('11b the session is still active', n = 1, n::TEXT);

  RESET ROLE;
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
