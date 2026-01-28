-- =============================================
-- MIGRATION: Add OCR Error Tracking
-- PURPOSE: Add ocr_error field to tickets table to store detailed error messages
-- DATE: 2026-01-27
-- =============================================

-- Add ocr_error column to tickets table
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS ocr_error TEXT;

-- Add comment
COMMENT ON COLUMN public.tickets.ocr_error IS 'Stores detailed OCR error messages when ocr_status is failed';
