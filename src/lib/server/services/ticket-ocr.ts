import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { getOCRFunctionURL } from '@/lib/config/ocr'
import { OCR_REQUEST_TIMEOUT_MS, OCR_STALE_AFTER_MS, OCR_TIMEOUT_MESSAGE, OCR_UNAVAILABLE_MESSAGE } from '@/lib/config/ocr-policy'
import type { createAuthenticatedClient } from '@/lib/api/auth'

type Supabase = Awaited<ReturnType<typeof createAuthenticatedClient>>['supabase']

/** During an active read, processed_at records the attempt start; terminal writes replace it with the finish time. */
export async function expireTicketReads(supabase: Supabase, userId: string, ticketId?: string) {
  const cutoff = new Date(Date.now() - OCR_STALE_AFTER_MS).toISOString()
  let query = supabase.from('tickets')
    .update({ ocr_status: 'failed', ocr_error: OCR_TIMEOUT_MESSAGE, processed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('ocr_status', ['pending', 'processing'])
    .or(`processed_at.lt.${cutoff},and(processed_at.is.null,created_at.lt.${cutoff})`)
  if (ticketId) query = query.eq('id', ticketId)
  const { error } = await query
  if (error) throw new ApiServiceError(503, ErrorCode.INTERNAL_ERROR, 'Unable to check receipt progress. Please try again.')
}

export async function requestTicketOcr(supabase: Supabase, userId: string, ticketId: string, imageUrls: string[], attemptStartedAt: string) {
  const controller = new AbortController()
  // Explicit cancellation also releases the response body if a dependency stalls after sending headers.
  const timer = setTimeout(() => controller.abort(), OCR_REQUEST_TIMEOUT_MS)
  let message = OCR_UNAVAILABLE_MESSAGE
  try {
    const response = await fetch(getOCRFunctionURL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      body: JSON.stringify({ ticketId, imageUrls, imageUrl: imageUrls[0] }),
      signal: controller.signal,
    })
    await response.body?.cancel()
    if (response.ok) return
  } catch {
    if (controller.signal.aborted) message = OCR_TIMEOUT_MESSAGE
  } finally {
    clearTimeout(timer)
  }

  const { error } = await supabase.from('tickets')
    .update({ ocr_status: 'failed', ocr_error: message })
    .eq('id', ticketId)
    .eq('user_id', userId)
    .eq('processed_at', attemptStartedAt)
    .in('ocr_status', ['pending', 'processing'])
  if (error) throw new ApiServiceError(503, ErrorCode.INTERNAL_ERROR, 'Unable to save receipt progress. Please refresh and try again.')
  throw new ApiServiceError(503, ErrorCode.INTERNAL_ERROR, message)
}
