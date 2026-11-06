// Shared by the OCR Edge Functions. Plain TypeScript with no Deno or network imports, so Vitest can test it too.
//
// A result without product lines is unreadable, even when a provider extracted a store or total.
// Mark it failed so the receipt screen offers a retry instead of attachment.

export const OCR_READ_FAILED_MESSAGE = 'We couldn’t read this receipt. Try again, or upload a clearer photo.'

export type OcrAnswer = { text: string } | { reason: string }

export interface OcrImageOutcome {
  itemCount: number
  /** Why this photo could not be read (provider error, empty or unreadable answer); `null` when it was read. */
  failure: string | null
}

export type OcrOutcome =
  /** `partial` is true when some photos were read and others were not, so the receipt may be missing lines. */
  | { status: 'completed'; partial: boolean }
  | { status: 'failed'; error: string }

/** A provider that is busy or down answers 408, 429 or 5xx; anything else (bad key, bad request) will not change on a retry. */
export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

interface RetryOptions {
  retries?: number
  delayMs?: number
  sleep?: (ms: number) => Promise<void>
}

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * Sends a request and sends it again when the provider is busy (408, 429, 5xx) or the network drops, up to `retries` more
 * times. A non-retryable answer is returned as it is; the last failure is returned or thrown, never swallowed.
 */
export async function fetchWithRetry(send: () => Promise<Response>, options: RetryOptions = {}): Promise<Response> {
  const { retries = 1, delayMs = 1500, sleep = wait } = options

  for (let attempt = 0; ; attempt++) {
    const isLast = attempt >= retries

    let response: Response
    try {
      response = await send()
    } catch (error) {
      if (isLast) throw error
      await sleep(delayMs * (attempt + 1))
      continue
    }

    if (response.ok || isLast || !isRetryableStatus(response.status)) return response
    await sleep(delayMs * (attempt + 1))
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

/**
 * The text of a Gemini `generateContent` answer. Reasoning ("thought") parts are skipped and the answer is the text of the
 * rest. A blocked prompt or an answer with no text returns the reason instead of an empty array that would read as a
 * receipt with no items.
 */
export function extractGeminiText(data: unknown): OcrAnswer {
  const root = asRecord(data)
  const blockReason = asRecord(root?.promptFeedback)?.blockReason
  if (typeof blockReason === 'string' && blockReason) return { reason: `Gemini blocked the request (${blockReason})` }

  const candidates = Array.isArray(root?.candidates) ? root.candidates : []
  const candidate = asRecord(candidates[0])
  if (!candidate) return { reason: 'Gemini returned no answer' }

  const parts = asRecord(candidate.content)?.parts
  const text = (Array.isArray(parts) ? parts : [])
    .map(asRecord)
    .filter(part => part && part.thought !== true && typeof part.text === 'string')
    .map(part => part!.text as string)
    .join('')
    .trim()

  if (text) return { text }

  const finishReason = typeof candidate.finishReason === 'string' ? candidate.finishReason : 'unknown'
  return { reason: `Gemini returned no text (finish reason ${finishReason})` }
}

/** The text of a chat-completions answer (OpenAI), with the reason when there is none. */
export function extractChatCompletionText(data: unknown): OcrAnswer {
  const choice = asRecord(Array.isArray(asRecord(data)?.choices) ? (asRecord(data)!.choices as unknown[])[0] : null)
  const message = asRecord(choice?.message)
  const content = typeof message?.content === 'string' ? message.content.trim() : ''

  if (content) return { text: content }

  const refusal = typeof message?.refusal === 'string' && message.refusal ? ' (refused)' : ''
  const finishReason = typeof choice?.finish_reason === 'string' ? choice.finish_reason : 'unknown'
  return { reason: `OpenAI returned no text${refusal} (finish reason ${finishReason})` }
}

/**
 * A readable receipt needs product lines. A store or total alone must not enable review or attachment.
 * Evaluate all photos together so an empty photo does not discard products found in another.
 */
export function decideOcrOutcome(images: OcrImageOutcome[], mergedItemCount: number): OcrOutcome {
  const failedCount = images.filter(image => image.failure !== null).length

  if (mergedItemCount > 0) return { status: 'completed', partial: failedCount > 0 }
  return { status: 'failed', error: OCR_READ_FAILED_MESSAGE }
}
