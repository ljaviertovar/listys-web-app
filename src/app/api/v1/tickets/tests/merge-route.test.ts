import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2, TEST_UUID_3 } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../[ticketId]/merge-to-base-list/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const LINE_A = '00000001-0000-4000-a000-000000000001'
const LINE_B = '00000001-0000-4000-a000-000000000002'
const ITEM = TEST_UUID_3

function signIn(rpc: { data?: unknown; error?: unknown }) {
  const { supabase } = createSupabaseMock({ rpcResults: { merge_ticket_items_to_base_list: rpc } })
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const SUMMARY = { data: [{ new_count: 1, updated_count: 1, skipped_count: 0 }], error: null }

const post = (body: Record<string, unknown>) =>
  POST(
    new Request(`http://localhost/api/v1/tickets/${TEST_UUID}/merge-to-base-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_list_id: TEST_UUID_2,
        items: [
          { id: LINE_A, merge: true },
          { id: LINE_B, merge: true },
        ],
        ...body,
      }),
    }),
    { params: Promise.resolve({ ticketId: TEST_UUID }) },
  )

describe('POST /api/v1/tickets/:ticketId/merge-to-base-list', () => {
  let consoleError: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('merges without links exactly as before (no links sent to the database)', async () => {
    const supabase = signIn(SUMMARY)

    const response = await post({})

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { success: true, new_count: 1, updated_count: 1, skipped_count: 0 } })
    expect(supabase.rpc).toHaveBeenCalledWith('merge_ticket_items_to_base_list', {
      p_ticket_id: TEST_UUID,
      p_base_list_id: TEST_UUID_2,
      p_item_ids: [LINE_A, LINE_B],
      p_max_items: 250,
      p_links: null,
    })
  })

  it('forwards the review decisions: a link to an item, and a remembered line added as new', async () => {
    const supabase = signIn(SUMMARY)
    const links = [
      { ticket_item_id: LINE_A, base_list_item_id: ITEM },
      { ticket_item_id: LINE_B, base_list_item_id: null },
    ]

    expect((await post({ links })).status).toBe(200)
    expect(supabase.rpc).toHaveBeenCalledWith('merge_ticket_items_to_base_list', expect.objectContaining({ p_links: links }))
  })

  it('answers 422 for a link to a line that is not selected, or two links for one line, before calling the database', async () => {
    const supabase = signIn(SUMMARY)
    const unselected = '00000001-0000-4000-a000-000000000009'

    const notSelected = await post({ links: [{ ticket_item_id: unselected, base_list_item_id: ITEM }] })
    const repeated = await post({
      links: [
        { ticket_item_id: LINE_A, base_list_item_id: ITEM },
        { ticket_item_id: LINE_A, base_list_item_id: null },
      ],
    })

    expect(notSelected.status).toBe(422)
    expect(repeated.status).toBe(422)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 422 when the database rejects a link (an item of another list)', async () => {
    signIn({ data: null, error: { code: '22023', message: 'A linked item is not in this list' } })

    const response = await post({ links: [{ ticket_item_id: LINE_A, base_list_item_id: ITEM }] })

    expect(response.status).toBe(422)
    expect((await response.json()).error.message).toBe('A linked item is not in this list')
  })

  it('answers 404 for a list that is not the user’s', async () => {
    signIn({ data: null, error: { code: 'P0002', message: 'Base list not found' } })

    expect((await post({})).status).toBe(404)
  })

  it('answers 409 LIMIT_EXCEEDED when the new items do not fit in the list', async () => {
    const message = 'Cannot merge items. This would exceed the maximum limit of 250 items per list (current: 250, trying to add: 1).'
    signIn({ data: null, error: { code: 'P0001', message } })

    const response = await post({})

    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatchObject({ code: 'LIMIT_EXCEEDED', message })
  })

  it('answers 409 CONFLICT when the receipt is already attached to a trip', async () => {
    signIn({ data: null, error: { code: 'P0001', message: 'RECEIPT_ATTACHED' } })
    const response = await post({})
    const body = await response.json()
    expect(response.status).toBe(409)
    expect(body.error).toMatchObject({
      code: 'CONFLICT',
      details: { reason: 'RECEIPT_ATTACHED' },
    })
  })

  it('hides any other database error behind a generic 500', async () => {
    signIn({ data: null, error: { code: '42501', message: 'permission denied for table "secret"' } })

    const response = await post({})

    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('secret')
  })
})
