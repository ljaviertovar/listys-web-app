-- =============================================
-- VERIFICATION: default list marker (Listys V3 boards)
-- Covers migration 20261101000000_default_list_marker.sql
-- =============================================
-- Runs inside ONE transaction that always ends in ROLLBACK, so nothing it creates survives. It uses synthetic
-- users (random UUIDs inserted into auth.users inside that transaction) and never reads or changes real accounts.
--   supabase db query --linked -f supabase/verification/default-list-marker.sql
-- The last statement returns one row per check; every row must have ok = true.

BEGIN;

CREATE TEMP TABLE verification_results (check_name TEXT, ok BOOLEAN, detail TEXT) ON COMMIT DROP;
GRANT ALL ON verification_results TO PUBLIC;

DO $$
DECLARE
  u1 UUID := gen_random_uuid(); -- new account provisioned through ensure_default_pantry
  u2 UUID := gen_random_uuid(); -- has lists but no default list
  g2 UUID;
  n INTEGER;
  r BOOLEAN;
  err TEXT;
BEGIN
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (u1, 'authenticated', 'authenticated', u1 || '@verify.invalid'),
         (u2, 'authenticated', 'authenticated', u2 || '@verify.invalid');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  -- 1. a new account starts with exactly one default list
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1 AND is_default;
  INSERT INTO verification_results VALUES ('1a the first call created the list', r = TRUE, r::TEXT);
  INSERT INTO verification_results VALUES ('1b exactly one default list', n = 1, n::TEXT);

  -- 2. repeating the call creates nothing
  r := public.ensure_default_pantry('My Lists', 'Pantry');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u1;
  INSERT INTO verification_results VALUES ('2a repeat returns false', r = FALSE, r::TEXT);
  INSERT INTO verification_results VALUES ('2b still one list', n = 1, n::TEXT);

  -- 3. the database refuses a second default list for the same user
  BEGIN
    INSERT INTO public.base_lists (group_id, user_id, name, is_default)
    SELECT group_id, user_id, 'Second', TRUE FROM public.base_lists WHERE user_id = u1 LIMIT 1;
    err := NULL;
  EXCEPTION WHEN unique_violation THEN
    err := 'unique_violation';
  END;
  INSERT INTO verification_results VALUES ('3 a second default list is rejected', err = 'unique_violation', COALESCE(err, 'accepted'));

  -- 4. lists created by hand are not default
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO public.groups (user_id, name) VALUES (u2, 'Walmart') RETURNING id INTO g2;
  INSERT INTO public.base_lists (group_id, user_id, name) VALUES (g2, u2, 'Weekly');
  SELECT COUNT(*) INTO n FROM public.base_lists WHERE user_id = u2 AND is_default;
  INSERT INTO verification_results VALUES ('4 a list created without the marker is not default', n = 0, n::TEXT);
END;
$$;

SELECT check_name, ok, detail FROM verification_results ORDER BY check_name;

ROLLBACK;
