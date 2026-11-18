-- The invoker trigger must see active trips on a list even when another
-- account owns the trip.
create policy "List owners can view active trips on their lists"
on public.shopping_sessions
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.base_lists as list
    where list.id = shopping_sessions.base_list_id
      and list.user_id = (select auth.uid())
  )
);

create or replace function public.prevent_base_list_delete_with_active_trip()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  active_trip_id uuid;
begin
  select session.id
    into active_trip_id
    from public.shopping_sessions as session
   where session.base_list_id = old.id
     and session.status = 'active'
   limit 1;

  if active_trip_id is not null then
    raise exception using
      errcode = 'P0001',
      message = 'LIST_HAS_ACTIVE_TRIP',
      detail = active_trip_id::text;
  end if;

  return old;
end;
$$;

create trigger prevent_base_list_delete_with_active_trip
before delete on public.base_lists
for each row
execute function public.prevent_base_list_delete_with_active_trip();
