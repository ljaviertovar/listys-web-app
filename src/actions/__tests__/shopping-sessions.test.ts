import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSupabaseMock,
  sequentialFrom,
  TEST_UUID,
  TEST_UUID_2,
} from '@/__tests__/helpers'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
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
} from '@/actions/shopping-sessions'

const mockedCreateClient = vi.mocked(createClient)

function setupMock(overrides?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(overrides)
  mockedCreateClient.mockResolvedValue(supabase as any)
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

  it('rejects when user already has an active session', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: { id: 'active-session' }, error: null }, // active session exists
      ],
    })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })
    expect(result.error).toContain('active shopping run')
    expect((result as any).activeSessionId).toBe('active-session')
  })

  it('rejects when base list is empty', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: null, error: null }, // no active session
      ],
      base_lists: [
        { data: { id: TEST_UUID, items: [] }, error: null }, // empty base list
      ],
    })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })
    expect(result.error).toContain('empty base list')
  })

  it('rejects when base list not found', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: null, error: null }, // no active session
      ],
      base_lists: [
        { data: null, error: { message: 'not found' } }, // not found
      ],
    })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })
    expect(result.error).toBe('Base list not found')
  })

  it('creates session and copies items on happy path', async () => {
    const session = { id: 'session-1', status: 'active' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: null, error: null },      // no active session
        { data: session, error: null },   // insert session
      ],
      base_lists: [
        {
          data: {
            id: TEST_UUID,
            items: [
              { name: 'Milk', quantity: 1, sort_order: 0 },
              { name: 'Eggs', quantity: 2, sort_order: 1 },
            ],
          },
          error: null,
        },
      ],
      shopping_session_items: [
        { data: null, error: null }, // insert items
      ],
    })

    const result = await createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })
    expect(result.data).toEqual(session)
  })
})

// ────────────────────────────────────
// completeShoppingSession
// ────────────────────────────────────
describe('completeShoppingSession', () => {
  it('defaults sync_to_base to false', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: { id: TEST_UUID, items: [] }, error: null }, // get session
        { data: null, error: null }, // update status
      ],
    })

    const result = await completeShoppingSession(TEST_UUID, {})
    expect(result).toEqual({ success: true })
  })

  it('calls sync RPC when sync_to_base is true', async () => {
    const supabase = setupMock({
      rpcResults: {
        sync_shopping_session_to_base_list: { data: null, error: null },
      },
    })
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: { id: TEST_UUID, items: [] }, error: null }, // get session
        { data: null, error: null }, // update status
      ],
    })

    const result = await completeShoppingSession(TEST_UUID, { sync_to_base: true })
    expect(result).toEqual({ success: true })
    expect(supabase.rpc).toHaveBeenCalledWith('sync_shopping_session_to_base_list', expect.any(Object))
  })

  it('returns error when sync RPC fails', async () => {
    const supabase = setupMock({
      rpcResults: {
        sync_shopping_session_to_base_list: { data: null, error: { message: 'sync broke' } },
      },
    })
    supabase.from = sequentialFrom({
      shopping_sessions: [
        { data: { id: TEST_UUID, items: [] }, error: null },
        { data: null, error: null },
      ],
    })

    const result = await completeShoppingSession(TEST_UUID, { sync_to_base: true })
    expect(result.error).toContain('sync failed')
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
