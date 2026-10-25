-- =============================================
-- VERIFICATION: default group on demand (PRD v3 Phase 2)
-- Covers migration 20261024000000_ensure_default_group.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
-- Run it only against a database you are allowed to write to inside a transaction, e.g.:
--   supabase db query --linked -f supabase/verification/flat-lists-default-group.sql
-- The last statement returns one row per check; every row must have ok = true.
--
-- Not covered here: two simultaneous first calls cannot be raced inside a single transaction. That guarantee is the
-- partial unique index uq_groups_one_default_per_user; check 3 proves the "already exists" path it relies on.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid(); -- has a list in its own group, no default group
  u2 UUID := gen_random_uuid(); -- new user provisioned through ensure_default_pantry
  u3 UUID := gen_random_uuid(); -- observer (RLS)
  g1 UUID;
  d1 UUID;
  d1b UUID;
  d2 UUID;
  d2b UUID;
  n INTEGER;
  r BOOLEAN;
  err TEXT;
  names_before TEXT;
  names_after TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid'),
         (u3, 'authenticated', 'authenticated', u3 || '@verify.invalid');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  -- u1: an account from before the default group existed (a group with a list, no is_default group)
  INSERT INTO public.groups (user_id, name) VALUES (u1, 'Walmart') RETURNING id INTO g1;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g1, u1, 'Weekly');
  SELECT string_agg(name, ',' ORDER BY name) INTO names_before FROM public.groups WHERE user_id = u1;

  -- 1. first call creates exactly one default group and touches nothing else
  d1 := public.ensure_default_group('My Lists');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1 AND is_default;
  INSERT INTO verification_results VALUES ('1a first call returns the new default group id', d1 IS NOT NULL, d1::TEXT);
  INSERT INTO verification_results VALUES ('1b exactly one default group', n = 1, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('1c the old group is untouched (two groups in total)', n = 2, n::TEXT);
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1 AND group_id = g1 AND name = 'Weekly';
  INSERT INTO verification_results VALUES ('1d the old list is still in its group', n = 1, n::TEXT);

  -- 2. repeating the call returns the same group and creates nothing
  d1b := public.ensure_default_group('My Lists');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2a repeat returns the same id', d1b = d1, d1b::TEXT);
  INSERT INTO verification_results VALUES ('2b repeat creates no group', n = 2, n::TEXT);
  SELECT string_agg(name, ',' ORDER BY name) INTO names_after FROM public.groups WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2c group names unchanged apart from the new one', names_before = 'Walmart' AND names_after = 'My Lists,Walmart', names_after);

  -- 3. a user who already has the default group from ensure_default_pantry gets that one
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT id INTO d2 FROM public.groups WHERE user_id = u2 AND is_default;
  d2b := public.ensure_default_group('Another name');
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id = u2;
  INSERT INTO verification_results VALUES ('3a pantry provisioning created the default group', r IS TRUE AND d2 IS NOT NULL, r::TEXT);
  INSERT INTO verification_results VALUES ('3b ensure_default_group returns it', d2b = d2, d2b::TEXT);
  INSERT INTO verification_results VALUES ('3c still one group (the given name is ignored when one exists)', n = 1, n::TEXT);

  -- 4. ensure_default_pantry still declines for a user who owns a list
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('4a pantry provisioning returns false for an account with lists', r IS FALSE, r::TEXT);
  INSERT INTO verification_results VALUES ('4b no Pantry list was added', n = 1, n::TEXT);

  -- 5. RLS: u3 cannot see u1's or u2's groups
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  SELECT COUNT(*) INTO n FROM public.groups WHERE user_id IN (u1, u2);
  INSERT INTO verification_results VALUES ('5 other user cannot read default groups', n = 0, n::TEXT);

  -- 6. the observer gets their own default group, not someone else's
  d1b := public.ensure_default_group('My Lists');
  INSERT INTO verification_results VALUES ('6 each user gets a distinct default group', d1b IS NOT NULL AND d1b <> d1 AND d1b <> d2, d1b::TEXT);

  -- 7. no identity -> error
  PERFORM set_config('request.jwt.claims', '{}', true);
  BEGIN
    PERFORM public.ensure_default_group('My Lists');
    INSERT INTO verification_results VALUES ('7 anonymous call is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO verification_results VALUES ('7 anonymous call is rejected', SQLERRM = 'Unauthorized', SQLERRM);
  END;

  -- 8. invalid names are rejected and create nothing
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  BEGIN
    PERFORM public.ensure_default_group('   ');
    INSERT INTO verification_results VALUES ('8a blank name is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('8a blank name is rejected', err = 'Invalid default group name', err);
  END;
  BEGIN
    PERFORM public.ensure_default_group(repeat('x', 101));
    INSERT INTO verification_results VALUES ('8b name over 100 characters is rejected', FALSE, 'no error');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err = MESSAGE_TEXT;
    INSERT INTO verification_results VALUES ('8b name over 100 characters is rejected', err = 'Invalid default group name', err);
  END;

  -- 9. the new row records its timestamps
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SELECT COUNT(*) INTO n FROM public.groups WHERE id = d1 AND created_at IS NOT NULL AND updated_at IS NOT NULL;
  INSERT INTO verification_results VALUES ('9 created_at and updated_at are set', n = 1, n::TEXT);

  RESET ROLE;
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
