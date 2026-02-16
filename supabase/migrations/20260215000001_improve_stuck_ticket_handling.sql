-- Migration: Improved stuck ticket handling with attempt limits
-- Adds better timeout handling and max retry logic

-- Drop the old function first
DROP FUNCTION IF EXISTS mark_stuck_tickets_as_failed();

-- Update the function to handle attempts and add error messages
CREATE OR REPLACE FUNCTION mark_stuck_tickets_as_failed()
RETURNS TABLE(updated_count INTEGER, ticket_ids TEXT[])
LANGUAGE plpgsql
AS $$
DECLARE
  v_timeout_minutes INTEGER := 10; -- Timeout for processing (10 minutes)
  v_max_attempts INTEGER := 3; -- Maximum OCR attempts
  v_updated_count INTEGER;
  v_ticket_ids TEXT[];
BEGIN
  -- Mark tickets that exceeded max attempts
  WITH updated_tickets AS (
    UPDATE public.tickets
    SET
      ocr_status = 'failed',
      ocr_error = 'Maximum OCR retry attempts (' || ocr_attempts || '/' || v_max_attempts || ') exceeded. Please delete this receipt and try uploading again with a clearer image.'
    WHERE ocr_status IN ('pending', 'processing')
      AND ocr_attempts >= v_max_attempts
      AND ocr_status != 'failed'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER, ARRAY_AGG(id::TEXT)
  INTO v_updated_count, v_ticket_ids
  FROM updated_tickets;

  IF v_updated_count > 0 THEN
    RAISE NOTICE 'Marked % ticket(s) as failed due to max attempts: %', v_updated_count, v_ticket_ids;
  END IF;

  -- Mark tickets stuck in processing for too long
  WITH timed_out_tickets AS (
    UPDATE public.tickets
    SET
      ocr_status = 'failed',
      ocr_error = 'OCR processing timed out after ' || v_timeout_minutes || ' minutes. The process may have crashed. Please try again or delete this receipt.'
    WHERE ocr_status = 'processing'
      AND created_at < NOW() - (v_timeout_minutes || ' minutes')::INTERVAL
      AND ocr_status = 'processing'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER, ARRAY_AGG(id::TEXT)
  INTO v_updated_count, v_ticket_ids
  FROM timed_out_tickets;

  IF v_updated_count > 0 THEN
    RAISE NOTICE 'Marked % ticket(s) as failed due to timeout: %', v_updated_count, v_ticket_ids;
  END IF;

  -- Mark tickets stuck in pending for too long (edge function never triggered)
  WITH abandoned_tickets AS (
    UPDATE public.tickets
    SET
      ocr_status = 'failed',
      ocr_error = 'Receipt was not processed within ' || v_timeout_minutes || ' minutes. The system may be experiencing issues. Please try uploading again.'
    WHERE ocr_status = 'pending'
      AND created_at < NOW() - (v_timeout_minutes || ' minutes')::INTERVAL
      AND ocr_status = 'pending'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER, ARRAY_AGG(id::TEXT)
  INTO v_updated_count, v_ticket_ids
  FROM abandoned_tickets;

  IF v_updated_count > 0 THEN
    RAISE NOTICE 'Marked % ticket(s) as failed due to pending timeout: %', v_updated_count, v_ticket_ids;
  END IF;

  RETURN QUERY
  SELECT 0, ARRAY[]::TEXT[];
END;
$$;

COMMENT ON FUNCTION mark_stuck_tickets_as_failed IS
'Marks tickets as failed based on: 1) Max OCR attempts exceeded (3), 2) Processing timeout (10 min), 3) Pending timeout (10 min). Returns count and IDs of updated tickets.';

-- Run the function immediately to catch any stuck tickets
SELECT mark_stuck_tickets_as_failed();
