import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/helpers'
import { OCR_REQUEST_TIMEOUT_MS, OCR_STALE_AFTER_MS, OCR_TIMEOUT_MESSAGE, OCR_UNAVAILABLE_MESSAGE } from '@/lib/config/ocr-policy'
import { expireTicketReads, requestTicketOcr } from '../ticket-ocr'

vi.mock('@/lib/config/ocr', () => ({ getOCRFunctionURL: () => 'https://functions.test/ocr' }))

const START = '2026-11-20T12:00:00.000Z'

function setup() {
  const { supabase, fromMocks } = createSupabaseMock({ tables: { tickets: { data: null, error: null } } })
  return { supabase: supabase as unknown as Parameters<typeof requestTicketOcr>[0], tickets: fromMocks.tickets }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('bounded receipt reading', () => {
  it('aborts an unresponsive server and persists a safe failed state for this attempt only', async () => {
    vi.useFakeTimers()
    const { supabase, tickets } = setup()
    let signal: AbortSignal | undefined
    vi.stubGlobal('fetch', vi.fn((_url, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
      signal = init.signal as AbortSignal
      signal.addEventListener('abort', () => reject(new DOMException('private provider failure', 'AbortError')))
    })))
    const request = requestTicketOcr(supabase, 'user-1', 'ticket-1', ['https://signed.test'], START)
    const result = expect(request).rejects.toMatchObject({ status: 503, message: OCR_TIMEOUT_MESSAGE })
    await vi.advanceTimersByTimeAsync(OCR_REQUEST_TIMEOUT_MS)
    await result
    expect(signal?.aborted).toBe(true)
    expect(tickets.update).toHaveBeenCalledWith({ ocr_status: 'failed', ocr_error: OCR_TIMEOUT_MESSAGE })
    expect(tickets.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(tickets.eq).toHaveBeenCalledWith('processed_at', START)
    expect(tickets.in).toHaveBeenCalledWith('ocr_status', ['pending', 'processing'])
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each(['network', 'rejected'])('does not expose provider errors on a %s failure', async kind => {
    const { supabase, tickets } = setup()
    const fetchMock = kind === 'network'
      ? vi.fn().mockRejectedValue(new Error('secret-bearing provider URL'))
      : vi.fn().mockResolvedValue(new Response('private upstream error', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(requestTicketOcr(supabase, 'user-1', 'ticket-1', ['https://signed.test'], START))
      .rejects.toMatchObject({ status: 503, message: OCR_UNAVAILABLE_MESSAGE })
    expect(tickets.update).toHaveBeenCalledWith({ ocr_status: 'failed', ocr_error: OCR_UNAVAILABLE_MESSAGE })
  })

  it('leaves a successful read untouched and releases its deadline', async () => {
    vi.useFakeTimers()
    const { supabase, tickets } = setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    await requestTicketOcr(supabase, 'user-1', 'ticket-1', ['https://signed.test'], START)
    expect(tickets.update).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('interrupted receipt recovery', () => {
  it('expires active owned attempts using their start time, with a legacy upload-time fallback', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(START))
    const { supabase, tickets } = setup()
    await expireTicketReads(supabase, 'user-1', 'ticket-1')
    const cutoff = new Date(Date.now() - OCR_STALE_AFTER_MS).toISOString()
    expect(tickets.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(tickets.eq).toHaveBeenCalledWith('id', 'ticket-1')
    expect(tickets.in).toHaveBeenCalledWith('ocr_status', ['pending', 'processing'])
    expect(tickets.or).toHaveBeenCalledWith(`processed_at.lt.${cutoff},and(processed_at.is.null,created_at.lt.${cutoff})`)
    expect(tickets.update).toHaveBeenCalledWith(expect.objectContaining({ ocr_status: 'failed', ocr_error: OCR_TIMEOUT_MESSAGE }))
  })

  it('returns a safe error when the recovery write fails', async () => {
    const { supabase, tickets } = setup()
    tickets._result.error = { message: 'private SQL error' }
    await expect(expireTicketReads(supabase, 'user-1')).rejects.toMatchObject({ status: 503, message: 'Unable to check receipt progress. Please try again.' })
  })
})
