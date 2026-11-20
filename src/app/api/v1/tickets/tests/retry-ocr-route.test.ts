import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryBuilder, createSupabaseMock } from '@/test/helpers'
import { OCR_UNAVAILABLE_MESSAGE } from '@/lib/config/ocr-policy'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))
vi.mock('@/lib/config/ocr', () => ({ getOCRFunctionURL: () => 'https://functions.test/ocr' }))
import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../[ticketId]/retry-ocr/route'

const ID = '22222222-2222-4222-8222-222222222222'
const START = '2026-11-20T12:00:00.000Z'
function setup(status = 'failed', claimAvailable = true) {
  const { supabase } = createSupabaseMock()
  const recovery = createQueryBuilder({ data: null, error: null })
  const ticket = createQueryBuilder({ data: { id: ID, ocr_status: status, image_path: 'user-1/receipt.png', ocr_attempts: 1 }, error: null })
  const claim = createQueryBuilder({ data: claimAvailable ? { id: ID } : null, error: null })
  const items = createQueryBuilder({ data: null, error: null })
  const failure = createQueryBuilder({ data: null, error: null })
  supabase.from.mockReturnValueOnce(recovery).mockReturnValueOnce(ticket).mockReturnValueOnce(claim).mockReturnValueOnce(items).mockReturnValue(failure)
  vi.mocked(createAuthenticatedClient).mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return { recovery, claim, items, failure }
}
const retry = () => POST(new Request(`http://localhost/api/v1/tickets/${ID}/retry-ocr`, { method: 'POST' }), { params: Promise.resolve({ ticketId: ID }) })
beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date(START))
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private provider details', { status: 503 })))
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('POST receipt retry', () => {
  it('starts a fresh attempt and stores a safe failure when the service is unavailable', async () => {
    const { claim, failure } = setup()
    const response = await retry()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: { message: OCR_UNAVAILABLE_MESSAGE } })
    expect(claim.update).toHaveBeenCalledWith(expect.objectContaining({ ocr_status: 'pending', processed_at: START }))
    expect(failure.update).toHaveBeenCalledWith({ ocr_status: 'failed', ocr_error: OCR_UNAVAILABLE_MESSAGE })
    expect(failure.eq).toHaveBeenCalledWith('processed_at', START)
  })

  it('does not clear items or send another request if another retry claimed the receipt', async () => {
    const { items } = setup('failed', false)
    expect((await retry()).status).toBe(409)
    expect(items.delete).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
})
