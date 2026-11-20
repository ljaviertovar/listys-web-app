// Provider work stops first, leaving time for the web request to persist its terminal state.
export const OCR_PROCESSING_TIMEOUT_MS = 75_000
export const OCR_REQUEST_TIMEOUT_MS = 90_000
export const OCR_STALE_AFTER_MS = 3 * 60_000

export const OCR_TIMEOUT_MESSAGE = 'Reading took too long. The reading service may be busy or unavailable. Please try again in a few minutes.'
export const OCR_UNAVAILABLE_MESSAGE = 'The reading service could not be reached or is temporarily unavailable. Please try again in a few minutes.'
export const OCR_FAILED_MESSAGE = 'We couldn’t read this receipt. Try again, or upload a clearer photo.'

/** Only approved messages cross the API boundary; historical provider errors can contain secrets. */
export function safeOcrError(error: string | null): string | null {
  if (!error) return null
  if (error === OCR_TIMEOUT_MESSAGE || error === OCR_UNAVAILABLE_MESSAGE || error === OCR_FAILED_MESSAGE) return error
  return OCR_FAILED_MESSAGE
}
