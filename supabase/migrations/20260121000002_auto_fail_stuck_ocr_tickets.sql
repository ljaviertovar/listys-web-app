-- Migration: Auto-fail stuck OCR tickets
-- Tickets that are stuck in 'pending' or 'processing' for more than 5 minutes should be marked as 'failed'
-- This prevents tickets from being stuck forever if the Edge Function fails silently

-- Create a function to mark old pending/processing tickets as failed
CREATE OR REPLACE FUNCTION mark_stuck_tickets_as_failed()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark tickets that have been in 'pending' or 'processing' for more than 5 minutes as 'failed'
  UPDATE public.tickets
  SET ocr_status = 'failed'
  WHERE ocr_status IN ('pending', 'processing')
    AND created_at < NOW() - INTERVAL '5 minutes'
    AND (processed_at IS NULL OR processed_at < NOW() - INTERVAL '5 minutes');

  RAISE NOTICE 'Marked stuck tickets as failed';
END;
$$;

COMMENT ON FUNCTION mark_stuck_tickets_as_failed IS
'Marks tickets stuck in pending/processing status for more than 5 minutes as failed. Can be called manually or via cron.';

-- Optionally, you can run this function periodically using pg_cron extension
-- or call it from your application/edge function
-- For now, we'll just create the function and it can be called manually or via a scheduled job

-- Mark any existing stuck tickets as failed
SELECT mark_stuck_tickets_as_failed();
