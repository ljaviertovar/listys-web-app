-- =============================================
-- CLEANUP ORPHANED STORAGE IMAGES
-- =============================================
-- Purpose: Automatically delete ticket images from storage when tickets are deleted
-- Impact: Prevents storage cost leaks from orphaned images
-- Created: 2026-01-21

-- Create a function to delete the storage image when a ticket is deleted
CREATE OR REPLACE FUNCTION delete_ticket_storage_image()
RETURNS TRIGGER AS $$
DECLARE
  bucket_name TEXT := 'tickets';
BEGIN
  -- Only proceed if the ticket has an image_path
  IF OLD.image_path IS NOT NULL AND OLD.image_path != '' THEN
    -- Delete the file from storage
    -- Note: This uses the storage.objects table directly
    DELETE FROM storage.objects
    WHERE bucket_id = bucket_name
      AND name = OLD.image_path;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean up storage on ticket deletion
DROP TRIGGER IF EXISTS on_ticket_delete_cleanup_storage ON public.tickets;

CREATE TRIGGER on_ticket_delete_cleanup_storage
  BEFORE DELETE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION delete_ticket_storage_image();

-- =============================================
-- UTILITY: Find orphaned images in storage
-- =============================================
-- Purpose: Identify images in storage that don't have corresponding tickets
-- Usage: SELECT * FROM get_orphaned_storage_images();

CREATE OR REPLACE FUNCTION get_orphaned_storage_images()
RETURNS TABLE (
  image_path TEXT,
  size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.name::TEXT as image_path,
    COALESCE((o.metadata->>'size')::BIGINT, 0) as size,
    o.created_at
  FROM storage.objects o
  WHERE o.bucket_id = 'tickets'
    AND NOT EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.image_path = o.name
    )
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UTILITY: Cleanup existing orphaned images
-- =============================================
-- Purpose: One-time cleanup of orphaned images that already exist
-- Usage: SELECT cleanup_orphaned_storage_images();
-- WARNING: This will permanently delete images not linked to tickets

CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_images()
RETURNS TABLE (
  deleted_count INTEGER,
  total_size_bytes BIGINT
) AS $$
DECLARE
  v_deleted_count INTEGER;
  v_total_size BIGINT;
BEGIN
  -- Calculate metrics before deletion
  SELECT
    COUNT(*)::INTEGER,
    SUM((metadata->>'size')::BIGINT)
  INTO v_deleted_count, v_total_size
  FROM storage.objects o
  WHERE o.bucket_id = 'tickets'
    AND NOT EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.image_path = o.name
    );

  -- Delete orphaned images
  DELETE FROM storage.objects
  WHERE bucket_id = 'tickets'
    AND NOT EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.image_path = o.name
    );

  RETURN QUERY SELECT v_deleted_count, COALESCE(v_total_size, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION delete_ticket_storage_image() IS
'Automatically deletes ticket image from storage when ticket is deleted. Called by trigger.';

COMMENT ON FUNCTION get_orphaned_storage_images() IS
'Returns list of images in storage that have no corresponding ticket record.';

COMMENT ON FUNCTION cleanup_orphaned_storage_images() IS
'Deletes all orphaned images from storage and returns count and total size deleted. Use with caution.';
