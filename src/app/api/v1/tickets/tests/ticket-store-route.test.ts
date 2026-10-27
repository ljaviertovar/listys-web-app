import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { PATCH } from '../[ticketId]/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(rpc: { data?: unknown; error?: unknown }) {
  const { supabase } = createSupabaseMock({ rpcResults: { assign_ticket_store: rpc } })
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const patch = (body: unknown, ticketId = TEST_UUID) =>
  PATCH(
    new Request(`http://localhost/api/v1/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ ticketId }) },
  )

describe('PATCH /api/v1/tickets/:ticketId with store_id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('assigns one of the user’s stores through the database function', async () => {
    const supabase = signIn({ data: { id: TEST_UUID, store_id: TEST_UUID_2 }, error: null })

    const response = await patch({ store_id: TEST_UUID_2 })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { id: TEST_UUID, store_id: TEST_UUID_2 } })
    expect(supabase.rpc).toHaveBeenCalledWith('assign_ticket_store', { p_ticket_id: TEST_UUID, p_store_id: TEST_UUID_2 })
  })

  it('clears the store with null', async () => {
    const supabase = signIn({ data: { id: TEST_UUID, store_id: null }, error: null })

    const response = await patch({ store_id: null })

    expect(response.status).toBe(200)
    expect(supabase.rpc).toHaveBeenCalledWith('assign_ticket_store', { p_ticket_id: TEST_UUID, p_store_id: null })
  })

  it('answers 404 for a store that is not the user’s', async () => {
    signIn({ data: null, error: { code: 'P0002', message: 'Store not found' } })

    const response = await patch({ store_id: TEST_UUID_2 })

    expect(response.status).toBe(404)
    expect((await response.json()).error.message).toBe('Store not found')
  })

  it('answers 404 for a receipt that is missing or someone else’s', async () => {
    signIn({ data: null, error: { code: 'P0002', message: 'Ticket not found' } })

    expect((await patch({ store_id: TEST_UUID_2 })).status).toBe(404)
  })

  it('answers 422 for an invalid store id or an empty body, without calling the database', async () => {
    const supabase = signIn({ data: null, error: null })

    expect((await patch({ store_id: 'not-a-uuid' })).status).toBe(422)
    expect((await patch({})).status).toBe(422)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 401 when signed out', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    expect((await patch({ store_id: TEST_UUID_2 })).status).toBe(401)
  })
})
