import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2, TEST_UUID_3 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[ticketId]/matches/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(rpc: { data?: unknown; error?: unknown }) {
  const { supabase } = createSupabaseMock({ rpcResults: { ticket_item_matches: rpc } })
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const get = (query: string, ticketId = TEST_UUID) =>
  GET(new Request(`http://localhost/api/v1/tickets/${ticketId}/matches${query}`), { params: Promise.resolve({ ticketId }) })

describe('GET /api/v1/tickets/:ticketId/matches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns how every receipt line matches the list', async () => {
    const supabase = signIn({
      data: [
        { ticket_item_id: 'a', match_kind: 'name', base_list_item_id: TEST_UUID_3, base_list_item_name: 'Bread' },
        { ticket_item_id: 'b', match_kind: 'alias', base_list_item_id: TEST_UUID_3, base_list_item_name: '2% Milk 4L' },
        { ticket_item_id: 'c', match_kind: 'none', base_list_item_id: null, base_list_item_name: null },
      ],
      error: null,
    })

    const response = await get(`?base_list_id=${TEST_UUID_2}`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      data: [
        { ticket_item_id: 'a', match: 'name', base_list_item: { id: TEST_UUID_3, name: 'Bread' } },
        { ticket_item_id: 'b', match: 'alias', base_list_item: { id: TEST_UUID_3, name: '2% Milk 4L' } },
        { ticket_item_id: 'c', match: 'none', base_list_item: null },
      ],
    })
    expect(supabase.rpc).toHaveBeenCalledWith('ticket_item_matches', { p_ticket_id: TEST_UUID, p_base_list_id: TEST_UUID_2 })
  })

  it('answers 422 without a valid base_list_id', async () => {
    const supabase = signIn({ data: [], error: null })

    expect((await get('')).status).toBe(422)
    expect((await get('?base_list_id=nope')).status).toBe(422)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 404 for a receipt or list that is not the user’s', async () => {
    signIn({ data: null, error: { code: 'P0002', message: 'Base list not found' } })

    const response = await get(`?base_list_id=${TEST_UUID_2}`)

    expect(response.status).toBe(404)
    expect((await response.json()).error.message).toBe('Base list not found')
  })

  it('answers 401 when signed out', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    expect((await get(`?base_list_id=${TEST_UUID_2}`)).status).toBe(401)
  })
})
