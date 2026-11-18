-- =============================================
-- VERIFICATION: set up the default Pantry on demand
-- Covers migration 20261118160000_create_default_pantry.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
--   supabase db query --linked -f supabase/verification/create-default-pantry.sql
-- The last statement returns one row per check; every row must have ok = true.
-- Two simultaneous calls cannot be exercised from one transaction: the advisory lock and the partial unique index are
-- what protect that case, and check 9 proves the index refuses a second default list.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid(); -- has lists, no Pantry
  u2 UUID := gen_random_uuid(); -- has a list named "pantry" (lower case)
  u3 UUID := gen_random_uuid(); -- has two lists that match the name
  u4 UUID := gen_random_uuid(); -- new account provisioned through ensure_default_pantry
  u5 UUID := gen_random_uuid(); -- somebody else's account with a list named "Pantry"
  u6 UUID := gen_random_uuid(); -- no lists, while u5 owns a "Pantry"
  g UUID;
  l UUID;
  old_list UUID;
  groups_before INTEGER;
  lists_before INTEGER;
  n INTEGER;
  r JSONB;
  err TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  SELECT u, 'authenticated', 'authenticated', u || '@verify.invalid'
  FROM unnest(ARRAY[u1, u2, u3, u4, u5, u6]) AS u;

  -- 1. an account with lists and no Pantry gets a new, empty, marked one; its own data is untouched
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.groups (user_id, name) VALUES (u1, 'Walmart') RETURNING id INTO g;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g, u1, 'Weekly') RETURNING id INTO old_list;

  r := public.create_default_pantry('My Lists', 'Pantry');
  INSERT INTO verification_results VALUES ('1a outcome is created', r ->> 'outcome' = 'created', r::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1 AND is_default AND name = 'Pantry' AND id = (r ->> 'list_id')::UUID;
  INSERT INTO verification_results VALUES ('1b one marked Pantry, id returned', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('1c the old list is still there, plus the new one', n = 2, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE id = old_list AND name = 'Weekly' AND group_id = g AND NOT is_default;
  INSERT INTO verification_results VALUES ('1d the old list is unchanged', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1 AND is_default;
  INSERT INTO verification_results VALUES ('1e one implicit default group', n = 1, n::TEXT);

  -- 2. repeating the call changes nothing
  r := public.create_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2a repeat is existing', r ->> 'outcome' = 'existing', r::TEXT);
  INSERT INTO verification_results VALUES ('2b still two lists', n = 2, n::TEXT);

  -- 3. the database refuses a second default list for the same user
  BEGIN
    UPDATE public.base_lists SET is_default = TRUE WHERE id = old_list;
    err := NULL;
  EXCEPTION WHEN unique_violation THEN
    err := 'unique_violation';
  END;
  INSERT INTO verification_results VALUES ('3 a second default list is rejected', err = 'unique_violation', COALESCE(err, 'accepted'));

  -- 4. an existing list named "pantry" is adopted, not duplicated
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.groups (user_id, name) VALUES (u2, 'Home') RETURNING id INTO g;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g, u2, 'pantry') RETURNING id INTO old_list;
  SELECT COUNT(*) INTO groups_before FROM public.groups WHERE user_id = u2;
  SELECT COUNT(*) INTO lists_before FROM public.base_lists WHERE user_id = u2;

  r := public.create_default_pantry('My Lists', 'Pantry');
  INSERT INTO verification_results VALUES ('4a outcome is adopted', r ->> 'outcome' = 'adopted', r::TEXT);
  INSERT INTO verification_results VALUES ('4b the existing list is the one returned', (r ->> 'list_id')::UUID = old_list, r::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE id = old_list AND is_default AND name = 'pantry' AND group_id = g;
  INSERT INTO verification_results VALUES ('4c only the marker changed', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u2;
  INSERT INTO verification_results VALUES ('4d no list was created', n = lists_before, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u2;
  INSERT INTO verification_results VALUES ('4e no group was created', n = groups_before, n::TEXT);

  -- 5. with several matches the oldest one wins and the rest stay as they are
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.groups (user_id, name) VALUES (u3, 'Home') RETURNING id INTO g;
  INSERT INTO public.base_lists (group_id, user_id, name, created_at) VALUES (g, u3, 'PANTRY', now() - interval '2 days') RETURNING id INTO old_list;
  INSERT INTO public.base_lists (group_id, user_id, name, created_at) VALUES (g, u3, 'Pantry', now() - interval '1 day') RETURNING id INTO l;

  r := public.create_default_pantry('My Lists', 'Pantry');
  INSERT INTO verification_results VALUES ('5a the oldest match is adopted', (r ->> 'list_id')::UUID = old_list AND r ->> 'outcome' = 'adopted', r::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE id = l AND NOT is_default;
  INSERT INTO verification_results VALUES ('5b the other match is untouched', n = 1, n::TEXT);

  -- 6. a new account and a later call: existing, and the Pantry deleted by the user can be created again by hand
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u4, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  PERFORM public.ensure_default_pantry('My Lists', 'Pantry');
  r := public.create_default_pantry('My Lists', 'Pantry');
  INSERT INTO verification_results VALUES ('6a default from provisioning is existing', r ->> 'outcome' = 'existing', r::TEXT);
  DELETE FROM public.base_lists WHERE user_id = u4;
  r := public.create_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u4 AND is_default;
  INSERT INTO verification_results VALUES ('6b a deleted Pantry is created again on demand', r ->> 'outcome' = 'created' AND n = 1, r::TEXT);
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u4 AND is_default;
  INSERT INTO verification_results VALUES ('6c still one default group', n = 1, n::TEXT);

  -- 7. somebody else's "Pantry" is neither seen nor marked
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u5, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.groups (user_id, name) VALUES (u5, 'Home') RETURNING id INTO g;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g, u5, 'Pantry') RETURNING id INTO old_list;

  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u6, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  r := public.create_default_pantry('My Lists', 'Pantry');
  INSERT INTO verification_results VALUES ('7a u6 gets its own list', r ->> 'outcome' = 'created' AND (r ->> 'list_id')::UUID <> old_list, r::TEXT);
  RESET ROLE;
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE id = old_list AND NOT is_default;
  INSERT INTO verification_results VALUES ('7b u5 list is not marked by u6', n = 1, n::TEXT);

  -- 8. without a session the call is refused
  PERFORM set_config('request.jwt.claims', '{}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    r := public.create_default_pantry('My Lists', 'Pantry');
    err := NULL;
  EXCEPTION WHEN OTHERS THEN
    err := SQLERRM;
  END;
  INSERT INTO verification_results VALUES ('8 no session is Unauthorized', err = 'Unauthorized', COALESCE(err, 'accepted'));
  RESET ROLE;
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
