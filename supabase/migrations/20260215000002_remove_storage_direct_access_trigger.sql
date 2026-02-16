-- =============================================
-- REMOVE DIRECT STORAGE ACCESS TRIGGER
-- =============================================
-- Purpose: Remove database trigger that directly accesses storage.objects
-- Reason: Supabase no longer allows "DELETE FROM storage.objects" for security
-- Impact: Storage cleanup is now handled by application layer (deleteTicket action)
-- Created: 2026-02-15
-- Related: src/actions/tickets.ts::deleteTicket() handles storage cleanup via Storage API

-- Drop the trigger that was causing "Direct deletion from storage tables is not allowed" error
DROP TRIGGER IF EXISTS on_ticket_delete_cleanup_storage ON public.tickets;

-- Drop the function that used direct storage.objects DELETE
DROP FUNCTION IF EXISTS delete_ticket_storage_image();

-- Drop utility functions that query storage.objects directly
-- (These are less problematic but removed for consistency)
DROP FUNCTION IF EXISTS cleanup_orphaned_storage_images();
DROP FUNCTION IF EXISTS get_orphaned_storage_images();

-- =============================================
-- NOTES FOR DEVELOPERS
-- =============================================
--
-- Storage cleanup is now handled exclusively in application layer:
-- - src/actions/tickets.ts::deleteTicket() removes images via Storage API
-- - Supports both legacy single image (image_path) and multi-image (image_paths array)
--
-- Why we removed the trigger:
-- - Supabase security policy blocks "DELETE FROM storage.objects"
-- - Triggers cannot easily call Storage API (would require HTTP requests)
-- - Application-level cleanup is more explicit and testable
--
-- To manually cleanup orphaned images in the future:
-- - Use Supabase Dashboard → Storage → tickets bucket
-- - Or write a script using Storage API: supabase.storage.from('tickets').remove([...])
