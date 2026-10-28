import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSupabaseMock,
  sequentialFrom,
  TEST_UUID,
} from '@/test/helpers'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import {
  createShoppingSession,
  updateShoppingSession,
  completeShoppingSession,
  getActiveShoppingSession,
  getShoppingSession,
  getShoppingHistory,
  toggleShoppingSessionItem,
  createShoppingSessionItem,
  deleteShoppingSessionItem,
  cancelShoppingSession,
} from '@/actions'

const mockedCreateClient = vi.mocked(createClient)

function setupMock(overrides?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(overrides)
  mockedCreateClient.mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>)
  return supabase
}

// ────────────────────────────────────
// Auth guard
// ────────────────────────────────────
describe('Auth guard', () => {
  beforeEach(() => setupMock({ user: null }))

  it.each([
    ['createShoppingSession', () => createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })],
    ['updateShoppingSession', () => updateShoppingSession(TEST_UUID, {})],
    ['completeShoppingSession', () => completeShoppingSession(TEST_UUID, {})],
    ['getActiveShoppingSession', () => getActiveShoppingSession()],
    ['getShoppingSession', () => getShoppingSession(TEST_UUID)],
    ['getShoppingHistory', () => getShoppingHistory()],
    ['createShoppingSessionItem', () => createShoppingSessionItem({ shopping_session_id: TEST_UUID, name: 'X' })],
    ['deleteShoppingSessionItem', () => deleteShoppingSessionItem(TEST_UUID)],
    ['cancelShoppingSession', () => cancelShoppingSession(TEST_UUID)],
  ])('%s returns Unauthorized', async (_name, fn) => {
    expect(await fn()).toEqual({ error: 'Unauthorized' })
  })
})

// ────────────────────────────────────
// createShoppingSession
// ────────────────────────────────────
describe('createShoppingSession', () => {
  it('returns validation error for missing name', async () => {
    setupMock()
    const result = await createShoppingSession({ base_list_id: TEST_UUID })
    expect(result.error).toBeTruthy()
  })

  it('starts without a store through the atomic RPC', async () => {
    const session = { id: 'session-1', status: 'active' }
    const supabase = setupMock({ rpcResults: { start_shopping_session: { data: session, error: null } } })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })

    expect(result.data).toEqual(session)
    expect(supabase.rpc).toHaveBeenCalledWith('start_shopping_session', {
      p_base_list_id: TEST_UUID,
      p_name: 'Trip',
      p_store_id: null,
    })
  })

  it('starts with a selected store', async () => {
    const supabase = setupMock({ rpcResults: { start_shopping_session: { data: { id: 'session-1' }, error: null } } })

    await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip', store_id: TEST_UUID })

    expect(supabase.rpc).toHaveBeenCalledWith('start_shopping_session', expect.objectContaining({ p_store_id: TEST_UUID }))
  })

  it('returns the active session id on a per-list conflict', async () => {
    setupMock({ rpcResults: { start_shopping_session: {
      data: null,
      error: { code: '23505', message: 'SESSION_ALREADY_ACTIVE', details: TEST_UUID },
    } } })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })

    expect(result).toEqual({
      error: 'This list already has a shopping session in progress.',
      activeSessionId: TEST_UUID,
    })
  })

  it('maps empty lists and invisible lists to safe errors', async () => {
    setupMock({ rpcResults: { start_shopping_session: {
      data: null,
      error: { code: 'P0001', message: 'LIST_EMPTY' },
    } } })
    expect(await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).toEqual({
      error: 'Cannot start a shopping session from an empty list.',
    })

    setupMock({ rpcResults: { start_shopping_session: {
      data: null,
      error: { code: 'P0002', message: 'internal ownership detail' },
    } } })
    expect(await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).toEqual({ error: 'Not found' })
  })
})

// ────────────────────────────────────
// completeShoppingSession
// ────────────────────────────────────
describe('completeShoppingSession', () => {
  const SUMMARY = { new_count: 1, updated_count: 2, skipped_count: 0, over_limit_count: 0 }

  it('always completes through the RPC with the list capacity', async () => {
    const supabase = setupMock({ rpcResults: { complete_shopping_session: { data: [SUMMARY], error: null } } })

    const result = await completeShoppingSession(TEST_UUID, {})

    expect(result).toEqual({ success: true, sync: SUMMARY })
    expect(supabase.rpc).toHaveBeenCalledTimes(1)
    expect(supabase.rpc).toHaveBeenCalledWith('complete_shopping_session', expect.objectContaining({
      p_session_id: TEST_UUID,
      p_max_items: MAX_ITEMS_PER_BASE_LIST,
    }))
  })

  it.each([true, false])('ignores the legacy sync_to_base flag (%s) and still syncs', async flag => {
    const supabase = setupMock({ rpcResults: { complete_shopping_session: { data: [SUMMARY], error: null } } })

    const result = await completeShoppingSession(TEST_UUID, { sync_to_base: flag })

    expect(result).toEqual({ success: true, sync: SUMMARY })
    expect(supabase.rpc).toHaveBeenCalledTimes(1)
  })

  it('does not claim success when the RPC fails and hides the database message', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    setupMock({ rpcResults: { complete_shopping_session: { data: null, error: { message: 'relation "x" does not exist', code: '42P01' } } } })

    const result = await completeShoppingSession(TEST_UUID, {})

    expect(result).toEqual({ error: 'Could not complete the shopping session. Please try again.' })
    consoleError.mockRestore()
  })

  it('reports a session that is already completed', async () => {
    setupMock({ rpcResults: { complete_shopping_session: { data: null, error: { message: 'SESSION_NOT_ACTIVE', code: 'P0001' } } } })

    expect(await completeShoppingSession(TEST_UUID, {})).toEqual({ error: 'This shopping session is already completed.' })
  })
})

describe('updateShoppingSession status guard', () => {
  it('rejects status completed without writing', async () => {
    const supabase = setupMock()

    const result = await updateShoppingSession(TEST_UUID, { status: 'completed' })

    expect(result.error).toContain('complete operation')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('still saves a name change', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({ shopping_sessions: [{ data: { id: TEST_UUID, name: 'Trip' }, error: null }] })

    const result = await updateShoppingSession(TEST_UUID, { name: 'Trip' })

    expect(result.data).toEqual({ id: TEST_UUID, name: 'Trip' })
  })
})

describe('getShoppingSession receipt summary', () => {
  it('returns the attached receipt id and printed total for the session page', async () => {
    const session = { id: TEST_UUID, status: 'completed', items: [] }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [{ data: session, error: null }],
      tickets: [{ data: { id: 'receipt-1', total_amount: 84.5 }, error: null }],
    })

    const result = await getShoppingSession(TEST_UUID)

    expect(result).toEqual({
      data: { ...session, receipt: { id: 'receipt-1', total_amount: 84.5 } },
    })
    expect(supabase.from).toHaveBeenNthCalledWith(1, 'shopping_sessions')
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'tickets')
  })
})

// ────────────────────────────────────
// cancelShoppingSession
// ────────────────────────────────────
describe('cancelShoppingSession', () => {
  it('deletes session and returns success', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [{ data: null, error: null }],
    })

    const result = await cancelShoppingSession(TEST_UUID)
    expect(result).toEqual({ success: true })
  })
})

// ────────────────────────────────────
// createShoppingSessionItem
// ────────────────────────────────────
describe('createShoppingSessionItem', () => {
  it('returns validation error for invalid data', async () => {
    setupMock()
    const result = await createShoppingSessionItem({ shopping_session_id: 'bad-uuid', name: 'X' })
    expect(result.error).toBeTruthy()
  })

  it('auto-assigns next sort_order', async () => {
    const newItem = { id: 'item-1', name: 'Bread', sort_order: 5 }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_session_items: [
        { data: [{ sort_order: 4 }], error: null }, // existing max sort_order
        { data: newItem, error: null },              // insert
      ],
    })

    const result = await createShoppingSessionItem({
      shopping_session_id: TEST_UUID,
      name: 'Bread',
    })
    expect(result.data).toEqual(newItem)
  })
})

// ────────────────────────────────────
// toggleShoppingSessionItem
// ────────────────────────────────────
describe('toggleShoppingSessionItem', () => {
  it('delegates to updateShoppingSessionItem', async () => {
    const updated = { id: TEST_UUID, checked: true }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_session_items: [
        { data: updated, error: null },
      ],
    })

    const result = await toggleShoppingSessionItem(TEST_UUID, true)
    expect(result.data).toEqual(updated)
  })
})

// ────────────────────────────────────
// deleteShoppingSessionItem
// ────────────────────────────────────
describe('deleteShoppingSessionItem', () => {
  it('returns success', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_session_items: [{ data: null, error: null }],
    })

    const result = await deleteShoppingSessionItem(TEST_UUID)
    expect(result).toEqual({ success: true })
  })
})
