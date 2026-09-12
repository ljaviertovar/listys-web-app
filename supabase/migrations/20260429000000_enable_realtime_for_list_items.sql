-- Enable Supabase Realtime for shopping_session_items and base_list_items.
--
-- Two requirements for postgres_changes subscriptions:
-- 1. The table must be in the supabase_realtime publication.
-- 2. REPLICA IDENTITY FULL is required when filtering on non-primary-key columns
--    (e.g. shopping_session_id, base_list_id) so PostgreSQL includes those column
--    values in the WAL event that Supabase Realtime forwards to subscribers.
--
-- This migration is non-destructive: no rows are removed or modified.

ALTER TABLE public.shopping_session_items REPLICA IDENTITY FULL;
ALTER TABLE public.base_list_items REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_session_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.base_list_items;
