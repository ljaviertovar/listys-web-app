-- =============================================
-- MIGRATION: Multi-Image Tickets Support
-- PURPOSE: Allow multiple images per ticket for long receipts (50+ items)
-- DATE: 2026-01-28
-- =============================================

-- Add image_paths column to support multiple images (max 5)
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS image_paths TEXT[] DEFAULT '{}'::TEXT[];

-- Migrate existing single image_path to array
UPDATE public.tickets
SET image_paths = ARRAY[image_path]
WHERE image_path IS NOT NULL
  AND (image_paths IS NULL OR array_length(image_paths, 1) IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN public.tickets.image_paths IS 'Array of storage paths for ticket images (max 5). Used for long receipts captured in multiple photos.';

-- Note: We keep image_path for backward compatibility and as primary reference
-- The Edge Function will process all images in image_paths array and merge results
