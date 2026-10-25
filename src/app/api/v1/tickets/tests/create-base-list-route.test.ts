import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createSupabaseMock, sequentialFrom, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../[ticketId]/create-base-list/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const ITEM_ID = '00000001-0000-4000-a000-000000000001'

function signIn(opts?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(opts)
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const post = (body: Record<string, unknown>) =>
  POST(
    new Request(`http://localhost/api/v1/tickets/${TEST_UUID}/create-base-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'From receipt', item_ids: [ITEM_ID], ...body }),
    }),
    { params: Promise.resolve({ ticketId: TEST_UUID }) },
  )

describe('POST /api/v1/tickets/:ticketId/create-base-list', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates the list in the default group when group_id is omitted and links the receipt to it', async () => {
    const list = { id: 'list-1', name: 'From receipt', group_id: 'default-group' }
    const supabase = signIn({ rpcResults: { ensure_default_group: { data: 'default-group', error: null } } })
    const ticketUpdate = vi.fn().mockReturnThis()
    const builders = sequentialFrom({
      ticket_items: [{ data: [{ id: ITEM_ID, name: 'Milk', quantity: 1 }], error: null }],
      base_lists: [
        { data: null, error: null },
        { data: list, error: null },
      ],
      base_list_items: [{ data: null, error: null }],
      tickets: [{ data: null, error: null }],
    })
    supabase.from = vi.fn().mockImplementation((table: string) => {
      const builder = builders(table)
      if (table === 'tickets') builder.update = ticketUpdate
      return builder
    })

    const response = await post({})

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: list })
    expect(ticketUpdate).toHaveBeenCalledWith({ base_list_id: 'list-1', group_id: 'default-group' })
  })

  it('answers 404 for a group that is not the user’s and creates no list', async () => {
    const supabase = signIn()
    const insertSpy = vi.fn()
    const builders = sequentialFrom({
      ticket_items: [{ data: [{ id: ITEM_ID, name: 'Milk', quantity: 1 }], error: null }],
      base_lists: [{ data: null, error: null }],
      groups: [{ data: null, error: null }],
    })
    supabase.from = vi.fn().mockImplementation((table: string) => {
      const builder = builders(table)
      if (table === 'base_lists') builder.insert = insertSpy
      return builder
    })

    const response = await post({ group_id: TEST_UUID_2 })

    expect(response.status).toBe(404)
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('answers 409 when the user already has a list with that name in any group', async () => {
    const supabase = signIn()
    supabase.from = sequentialFrom({
      ticket_items: [{ data: [{ id: ITEM_ID, name: 'Milk', quantity: 1 }], error: null }],
      base_lists: [{ data: { id: 'existing' }, error: null }],
    })

    const response = await post({})
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.error.message).toBe('A list with this name already exists. Please choose a different name.')
  })

  it('answers 422 without a name and 401 when nobody is signed in', async () => {
    signIn()
    expect((await post({ name: '' })).status).toBe(422)

    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
    expect((await post({})).status).toBe(401)
  })
})
