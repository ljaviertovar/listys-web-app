import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createSupabaseMock, sequentialFrom, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { getTicket, getTickets } from '../tickets.service'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const STORE = { id: TEST_UUID_2, name: 'No Frills' }

function signIn(plan: Parameters<typeof sequentialFrom>[0], rpc?: { data?: unknown; error?: unknown }) {
  const { supabase } = createSupabaseMock({ rpcResults: rpc ? { resolve_store: rpc } : {} })
  supabase.from = sequentialFrom(plan)
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

describe('receipt reads with stores', () => {
  let consoleError: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('lists receipts with their confirmed store', async () => {
    const supabase = signIn({ tickets: [{ data: [{ id: TEST_UUID, store_id: STORE.id, store: STORE }], error: null }] })

    await expect(getTickets()).resolves.toEqual([{ id: TEST_UUID, store_id: STORE.id, store: STORE }])
    const builder = (supabase.from as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(builder.select.mock.calls[0][0]).toContain('store:stores(id, name)')
  })

  it('returns the confirmed store and no suggestion when the receipt has a store', async () => {
    const supabase = signIn({
      tickets: [{ data: { id: TEST_UUID, store_id: STORE.id, store_name: 'NOFRILLS', store: STORE }, error: null }],
      ticket_items: [{ data: [], error: null }],
    })

    const ticket = await getTicket(TEST_UUID)

    expect(ticket).toMatchObject({ store: STORE, store_suggestion: null })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('includes the linked trip for an attached receipt and null when no trip is attached', async () => {
    signIn({
      tickets: [{ data: {
        id: TEST_UUID,
        shopping_session_id: TEST_UUID_2,
        store_id: STORE.id,
        store_name: 'No Frills',
      }, error: null }],
      ticket_items: [{ data: [], error: null }],
      shopping_sessions: [{ data: { id: TEST_UUID_2, name: 'Saturday shop', status: 'completed' }, error: null }],
    })
    await expect(getTicket(TEST_UUID)).resolves.toMatchObject({
      shopping_session: { id: TEST_UUID_2, name: 'Saturday shop', status: 'completed' },
    })

    signIn({
      tickets: [{ data: { id: TEST_UUID, shopping_session_id: null, store_id: STORE.id, store_name: 'No Frills' }, error: null }],
      ticket_items: [{ data: [], error: null }],
    })
    await expect(getTicket(TEST_UUID)).resolves.toMatchObject({ shopping_session: null })
  })

  it('suggests the store the raw name resolves to', async () => {
    const supabase = signIn(
      {
        tickets: [{ data: { id: TEST_UUID, store_id: null, store_name: 'NOFRILLS #3127', store: null }, error: null }],
        ticket_items: [{ data: [], error: null }],
        stores: [{ data: STORE, error: null }],
      },
      { data: STORE.id, error: null },
    )

    const ticket = await getTicket(TEST_UUID)

    expect(supabase.rpc).toHaveBeenCalledWith('resolve_store', { p_raw_name: 'NOFRILLS #3127' })
    expect(ticket).toMatchObject({ store: null, store_suggestion: STORE })
  })

  it('suggests nothing when the raw name matches no store, or there is no raw name', async () => {
    signIn(
      {
        tickets: [{ data: { id: TEST_UUID, store_id: null, store_name: 'Fresh Co', store: null }, error: null }],
        ticket_items: [{ data: [], error: null }],
      },
      { data: null, error: null },
    )
    await expect(getTicket(TEST_UUID)).resolves.toMatchObject({ store_suggestion: null })

    const supabase = signIn({
      tickets: [{ data: { id: TEST_UUID, store_id: null, store_name: null, store: null }, error: null }],
      ticket_items: [{ data: [], error: null }],
    })
    await expect(getTicket(TEST_UUID)).resolves.toMatchObject({ store_suggestion: null })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('still loads the receipt when the suggestion fails, logging only the code', async () => {
    signIn(
      {
        tickets: [{ data: { id: TEST_UUID, store_id: null, store_name: 'Metro', store: null }, error: null }],
        ticket_items: [{ data: [{ id: 'item-1' }], error: null }],
      },
      { data: null, error: { code: '42501', message: 'permission denied for table "secret"' } },
    )

    const ticket = await getTicket(TEST_UUID)

    expect(ticket).toMatchObject({ id: TEST_UUID, store_suggestion: null, items: [{ id: 'item-1' }] })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret')
  })
})
