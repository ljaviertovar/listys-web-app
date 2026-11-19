-- Run on a provisioned local database using psql with ON_ERROR_STOP=1.
BEGIN;
SELECT gen_random_uuid() AS owner_id, gen_random_uuid() AS other_id,
  gen_random_uuid() AS group_id, gen_random_uuid() AS other_group_id,
  gen_random_uuid() AS first_list, gen_random_uuid() AS second_list,
  gen_random_uuid() AS other_list, gen_random_uuid() AS first_trip, gen_random_uuid() AS second_trip \gset

INSERT INTO auth.users(id) VALUES (:'owner_id'), (:'other_id');
INSERT INTO public.groups(id, user_id, name) VALUES
  (:'group_id', :'owner_id', 'Guard fixture'), (:'other_group_id', :'other_id', 'Guard fixture');
INSERT INTO public.base_lists(id, user_id, group_id, name) VALUES
  (:'first_list', :'owner_id', :'group_id', 'First'),
  (:'second_list', :'owner_id', :'group_id', 'Second'),
  (:'other_list', :'other_id', :'other_group_id', 'Other');
INSERT INTO public.base_list_items(base_list_id, name) VALUES (:'second_list', 'Milk');

-- Simulate active rows already present when the transitional guard is installed.
ALTER TABLE public.shopping_sessions DISABLE TRIGGER guard_one_active_trip_per_account;
INSERT INTO public.shopping_sessions(id, user_id, base_list_id, name, status) VALUES
  (:'first_trip', :'owner_id', :'first_list', 'First trip', 'active'),
  (:'second_trip', :'owner_id', :'second_list', 'Second trip', 'active');
ALTER TABLE public.shopping_sessions ENABLE TRIGGER guard_one_active_trip_per_account;
INSERT INTO public.shopping_sessions(user_id, base_list_id, name, status)
VALUES (:'other_id', :'other_list', 'Independent trip', 'active');

SELECT set_config('request.jwt.claim.sub', :'owner_id', true),
  set_config('test.second_list', :'second_list', true),
  set_config('test.first_list', :'first_list', true),
  set_config('test.first_trip', :'first_trip', true),
  set_config('test.second_trip', :'second_trip', true);
UPDATE public.shopping_sessions SET status = 'completed' WHERE id = :'first_trip';
DO $$
DECLARE
  conflict_id text;
BEGIN
  BEGIN
    PERFORM public.start_shopping_session(current_setting('test.second_list')::uuid, 'Blocked');
    RAISE EXCEPTION 'Expected account conflict';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'ACCOUNT_TRIP_ALREADY_ACTIVE' THEN RAISE; END IF;
    GET STACKED DIAGNOSTICS conflict_id = PG_EXCEPTION_DETAIL;
    IF conflict_id IS DISTINCT FROM current_setting('test.second_trip') THEN
      RAISE EXCEPTION 'Incorrect active trip ID';
    END IF;
  END;
  BEGIN
    INSERT INTO public.shopping_sessions(user_id, base_list_id, name, status)
    VALUES (auth.uid(), current_setting('test.first_list')::uuid, 'Direct start', 'active');
    RAISE EXCEPTION 'Expected direct write conflict';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'ACCOUNT_TRIP_ALREADY_ACTIVE' THEN RAISE; END IF;
  END;
  BEGIN
    UPDATE public.shopping_sessions SET status = 'active' WHERE id = current_setting('test.first_trip')::uuid;
    RAISE EXCEPTION 'Expected reactivation conflict';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'ACCOUNT_TRIP_ALREADY_ACTIVE' THEN RAISE; END IF;
  END;
END;
$$;
UPDATE public.shopping_sessions SET status = 'completed' WHERE id = :'second_trip';
SELECT public.start_shopping_session(:'second_list', 'Allowed after both close');
ROLLBACK;
