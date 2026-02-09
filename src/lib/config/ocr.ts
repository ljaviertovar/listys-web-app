/**
 * OCR Provider Configuration
 * Determines which Edge Function to call for ticket OCR processing.
 * Set PROCESS_TICKET_OCR_PROVIDER in .env to 'gemini' or 'openai'
 * Default: 'gemini'
 */

export type OCRProvider = 'gemini' | 'openai'

const raw = process.env.PROCESS_TICKET_OCR_PROVIDER || 'gemini'
const normalized = raw.trim().toLowerCase() as OCRProvider

export const OCR_PROVIDER: OCRProvider = normalized === 'openai' ? 'openai' : 'gemini'

/**
 * Get the Edge Function name for the configured OCR provider
 */
export function getOCRFunctionName(): string {
  return OCR_PROVIDER === 'openai' ? 'process-ticket-ocr-openai' : 'process-ticket-ocr-gemini'
}

/**
 * Get the Edge Function URL for the configured OCR provider
 */
export function getOCRFunctionURL(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured')

  const functionName = getOCRFunctionName()
  return `${supabaseUrl}/functions/v1/${functionName}`
}
