import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createQueryBuilder, createSupabaseMock, TEST_UUID, TEST_UUID_2, TEST_UUID_3 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[ticketId]/matches/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

type TableResult = { data?: unknown; error?: unknown }
type TablePlan = Record<string, TableResult[]>

function signIn(options: { tables?: TablePlan; rpcResults?: Record<string, TableResult> } = {}) {
  const { supabase } = createSupabaseMock({ rpcResults: options.rpcResults })
  const remaining = Object.fromEntries(Object.entries(options.tables ?? {}).map(([table, results]) => [table, [...results]]))
  supabase.from = vi.fn((table: string) => {
    const result = remaining[table]?.shift() ?? { data: null, error: null }
    return createQueryBuilder(result)
  }) as typeof supabase.from
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const get = (query: string, ticketId = TEST_UUID) =>
  GET(new Request(`http://localhost/api/v1/tickets/${ticketId}/matches${query}`), { params: Promise.resolve({ ticketId }) })

const emptyMatchResults = {
  ticket_item_matches: { data: [], error: null },
  ticket_item_suggestions: { data: [], error: null },
}

describe('GET /api/v1/tickets/:ticketId/matches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns line matches and suggestions for an explicit owned list', async () => {
    const supabase = signIn({
      tables: { base_lists: [{ data: { id: TEST_UUID_2, name: 'Office' }, error: null }] },
      rpcResults: {
        ticket_item_matches: {
          data: [
            { ticket_item_id: 'a', match_kind: 'name', base_list_item_id: TEST_UUID_3, base_list_item_name: 'Bananas' },
            { ticket_item_id: 'b', match_kind: 'none', base_list_item_id: null, base_list_item_name: null },
          ],
          error: null,
        },
        ticket_item_suggestions: {
          data: [{ ticket_item_id: 'b', base_list_item_id: TEST_UUID_3, base_list_item_name: 'Organic Bananas' }],
          error: null,
        },
      },
    })

    const response = await get(`?base_list_id=${TEST_UUID_2}`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      data: [
        {
          ticket_item_id: 'a',
          match: 'name',
          base_list_item: { id: TEST_UUID_3, name: 'Bananas' },
          suggestion: null,
        },
        {
          ticket_item_id: 'b',
          match: 'none',
          base_list_item: null,
          suggestion: { id: TEST_UUID_3, name: 'Organic Bananas' },
        },
      ],
      meta: { base_list: { id: TEST_UUID_2, name: 'Office' } },
    })
    expect(supabase.rpc).toHaveBeenCalledWith('ticket_item_matches', { p_ticket_id: TEST_UUID, p_base_list_id: TEST_UUID_2 })
    expect(supabase.rpc).toHaveBeenCalledWith('ticket_item_suggestions', { p_ticket_id: TEST_UUID, p_base_list_id: TEST_UUID_2 })
  })

  it('prefers the receipt’s own list when it belongs to the user', async () => {
    signIn({
      tables: {
        tickets: [{ data: { base_list_id: TEST_UUID_2 }, error: null }],
        base_lists: [{ data: { id: TEST_UUID_2, name: 'Office' }, error: null }],
      },
      rpcResults: emptyMatchResults,
    })

    const response = await get('')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], meta: { base_list: { id: TEST_UUID_2, name: 'Office' } } })
  })

  it('uses the most recently used owned list when the receipt has no list', async () => {
    signIn({
      tables: {
        tickets: [
          { data: { base_list_id: null }, error: null },
          { data: { base_list: { id: TEST_UUID_2, name: 'Office', user_id: 'user-1' } }, error: null },
        ],
      },
      rpcResults: emptyMatchResults,
    })

    const response = await get('')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], meta: { base_list: { id: TEST_UUID_2, name: 'Office' } } })
  })

  it('falls back to the oldest own list when the last-used list was deleted', async () => {
    signIn({
      tables: {
        tickets: [
          { data: { base_list_id: null }, error: null },
          { data: null, error: null },
        ],
        base_lists: [{ data: { id: TEST_UUID_3, name: 'Pantry' }, error: null }],
      },
      rpcResults: emptyMatchResults,
    })

    const response = await get('')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], meta: { base_list: { id: TEST_UUID_3, name: 'Pantry' } } })
  })

  it('uses the oldest own list when there is no prior receipt added to a list', async () => {
    signIn({
      tables: {
        tickets: [
          { data: { base_list_id: null }, error: null },
          { data: null, error: null },
        ],
        base_lists: [{ data: { id: TEST_UUID, name: 'Pantry' }, error: null }],
      },
      rpcResults: emptyMatchResults,
    })

    const response = await get('')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], meta: { base_list: { id: TEST_UUID, name: 'Pantry' } } })
  })

  it('returns no comparison target when the user has no own lists', async () => {
    const supabase = signIn({
      tables: {
        tickets: [
          { data: { base_list_id: null }, error: null },
          { data: null, error: null },
        ],
        base_lists: [{ data: null, error: null }],
      },
    })

    const response = await get('')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], meta: { base_list: null } })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('returns 404 for a foreign list', async () => {
    const supabase = signIn({ tables: { base_lists: [{ data: null, error: null }] } })

    const response = await get(`?base_list_id=${TEST_UUID_2}`)

    expect(response.status).toBe(404)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 422 for an invalid UUID', async () => {
    const supabase = signIn()

    expect((await get('?base_list_id=nope')).status).toBe(422)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('answers 401 when signed out', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    expect((await get('')).status).toBe(401)
  })
})
