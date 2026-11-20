import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryBuilder, createSupabaseMock } from '@/test/helpers'
import { OCR_TIMEOUT_MESSAGE } from '@/lib/config/ocr-policy'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))
import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[ticketId]/status/route'

const ID = '22222222-2222-4222-8222-222222222222'
beforeEach(() => vi.clearAllMocks())

describe('GET receipt status recovery', () => {
  it('recovers expired owned reads before responding with the terminal status', async () => {
    const { supabase } = createSupabaseMock()
    const recovery = createQueryBuilder({ data: null, error: null })
    const status = createQueryBuilder({ data: { id: ID, ocr_status: 'failed' }, error: null })
    supabase.from.mockReturnValueOnce(recovery).mockReturnValueOnce(status)
    vi.mocked(createAuthenticatedClient).mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
    const response = await GET(new Request(`http://localhost/api/v1/tickets/${ID}/status`), { params: Promise.resolve({ ticketId: ID }) })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { ocr_status: 'failed' } })
    expect(recovery.update).toHaveBeenCalledWith(expect.objectContaining({ ocr_status: 'failed', ocr_error: OCR_TIMEOUT_MESSAGE }))
    expect(recovery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(status.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })
})
