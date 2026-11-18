-- Run with psql -X -v ON_ERROR_STOP=1 against the local Supabase database
-- after installing the guard migration. All fixtures are rolled back.
begin;

do $$
declare
  list_owner uuid := gen_random_uuid();
  trip_owner uuid := gen_random_uuid();
  unrelated_user uuid := gen_random_uuid();
  group_id uuid;
  active_list uuid;
  empty_list uuid;
  completed_list uuid;
  active_trip uuid;
  completed_trip uuid;
  error_detail text;
begin
  insert into auth.users (id, aud, role, email)
  select id, 'authenticated', 'authenticated', id || '@verify.invalid'
  from unnest(array[list_owner, trip_owner, unrelated_user]) as users(id);

  insert into public.groups (user_id, name)
  values (list_owner, 'Guard verification') returning id into group_id;
  insert into public.base_lists (user_id, group_id, name)
  values (list_owner, group_id, 'Active trip') returning id into active_list;
  insert into public.base_lists (user_id, group_id, name)
  values (list_owner, group_id, 'No trip') returning id into empty_list;
  insert into public.base_lists (user_id, group_id, name)
  values (list_owner, group_id, 'Completed trip') returning id into completed_list;

  insert into public.shopping_sessions (user_id, base_list_id, name, status)
  values (trip_owner, active_list, 'Active trip', 'active') returning id into active_trip;
  insert into public.shopping_sessions (user_id, base_list_id, name, status, completed_at)
  values (list_owner, completed_list, 'Completed trip', 'completed', now()) returning id into completed_trip;

  perform set_config('request.jwt.claims', json_build_object('sub', unrelated_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if exists (select 1 from public.shopping_sessions where id = active_trip) then
    raise exception 'Unrelated user can see the active trip';
  end if;

  perform set_config('request.jwt.claims', json_build_object('sub', list_owner, 'role', 'authenticated')::text, true);
  begin
    delete from public.base_lists where id = active_list;
    raise exception 'Active list deletion should have been rejected' using errcode = 'XX000';
  exception when sqlstate 'P0001' then
    get stacked diagnostics error_detail = pg_exception_detail;
    if sqlerrm <> 'LIST_HAS_ACTIVE_TRIP' or error_detail is distinct from active_trip::text then
      raise;
    end if;
  end;

  if not exists (
    select 1 from public.shopping_sessions as trip
    join public.base_lists as list on list.id = trip.base_list_id
    where trip.id = active_trip and list.id = active_list and trip.status = 'active'
  ) then
    raise exception 'Rejected deletion must preserve the list and its reachable active trip';
  end if;

  delete from public.base_lists where id = empty_list;
  if not found then raise exception 'List without a trip should be deleted'; end if;
  delete from public.base_lists where id = completed_list;
  if not found then raise exception 'List with only a completed trip should be deleted'; end if;
  if exists (select 1 from public.shopping_sessions where id = completed_trip) then
    raise exception 'Completed trip should follow the existing list deletion cascade';
  end if;
  reset role;
end;
$$;

rollback;
