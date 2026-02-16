-- Fix: Make normalized_name trigger more robust
-- This ensures ticket_items insertions don't fail if normalize function has issues

-- Make the trigger function more defensive
CREATE OR REPLACE FUNCTION public.set_normalized_name_from_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try to normalize, fallback to NULL if it fails
  BEGIN
    NEW.normalized_name := public.normalize_item_name(NEW.name);
  EXCEPTION WHEN OTHERS THEN
    -- If normalization fails, just set to NULL and continue
    NEW.normalized_name := NULL;
    -- Log the error but don't block the INSERT
    RAISE WARNING 'Failed to normalize name for item: %. Error: %', NEW.name, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Update existing NULL normalized_names
UPDATE public.ticket_items
SET normalized_name = public.normalize_item_name(name)
WHERE normalized_name IS NULL;

UPDATE public.base_list_items
SET normalized_name = public.normalize_item_name(name)
WHERE normalized_name IS NULL;

UPDATE public.shopping_session_items
SET normalized_name = public.normalize_item_name(name)
WHERE normalized_name IS NULL;
