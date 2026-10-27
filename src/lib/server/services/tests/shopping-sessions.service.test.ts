import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthenticatedClient } from '@/lib/api/auth'
import { createSupabaseMock, TEST_UUID } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createShoppingSession, getShoppingHistory, getShoppingSession } from '../shopping-sessions.service'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(rpc: { data?: unknown; error?: { code?: string; message?: string; details?: string } | null }) {
  const { supabase } = createSupabaseMock({ rpcResults: { start_shopping_session: rpc } })
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

function signInWithTables(tables: Record<string, { data?: unknown; error?: unknown }>) {
	const { supabase } = createSupabaseMock({ tables })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

describe('createShoppingSession', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('calls the atomic start RPC with a nullable store id', async () => {
    const session = { id: 'session-1', store_id: TEST_UUID }
    const supabase = signIn({ data: session, error: null })

    await expect(createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip', store_id: TEST_UUID })).resolves.toEqual(session)
    expect(supabase.rpc).toHaveBeenCalledWith('start_shopping_session', {
      p_base_list_id: TEST_UUID,
      p_name: 'Trip',
      p_store_id: TEST_UUID,
    })
  })

  it('maps list ownership and empty-list errors without exposing database details', async () => {
    signIn({ data: null, error: { code: 'P0002', message: 'private ownership detail' } })
    await expect(createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).rejects.toMatchObject({ status: 404, message: 'Not found' })

    signIn({ data: null, error: { code: 'P0001', message: 'LIST_EMPTY' } })
    await expect(createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).rejects.toMatchObject({
      status: 409,
      message: 'Cannot start a shopping session from an empty list.',
    })
  })

  it('maps the active list conflict and preserves its id in details', async () => {
    signIn({ data: null, error: { code: '23505', message: 'SESSION_ALREADY_ACTIVE', details: TEST_UUID } })

    await expect(createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).rejects.toMatchObject({
      status: 409,
      message: 'This list already has a shopping session in progress.',
      details: { activeSessionId: TEST_UUID },
    })
  })

  it('hides unexpected database errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    signIn({ data: null, error: { code: '42P01', message: 'relation secret_table does not exist' } })

    await expect(createShoppingSession({ base_list_id: TEST_UUID, name: 'Trip' })).rejects.toMatchObject({
      status: 500,
      message: 'Something went wrong. Please try again.',
    })
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('secret_table')
  })
})

describe('shopping session store reads', () => {
	beforeEach(() => vi.clearAllMocks())

	it('keeps the embedded store and item scope flag on session detail reads', async () => {
		const session = {
			id: 'session-1',
			user_id: 'user-1',
			store: { id: 'store-1', name: 'No Frills' },
			items: [{ id: 'item-1', is_other_store: true }],
		}
		signInWithTables({ shopping_sessions: { data: session, error: null } })

		await expect(getShoppingSession('session-1')).resolves.toMatchObject({
			store: { id: 'store-1', name: 'No Frills' },
			items: [{ is_other_store: true }],
		})
	})

	it('keeps an unreadable store as null on session detail and history reads', async () => {
		const detail = { id: 'session-1', user_id: 'user-1', store: null, items: [{ id: 'item-1', is_other_store: false }] }
		signInWithTables({ shopping_sessions: { data: detail, error: null } })
		await expect(getShoppingSession('session-1')).resolves.toMatchObject({ store: null })

		const history = { id: 'session-2', user_id: 'user-1', store: null, base_list: { name: 'Pantry' } }
		signInWithTables({
			shopping_sessions: { data: [history], error: null },
			shopping_session_items: { data: [], error: null },
		})
		await expect(getShoppingHistory()).resolves.toMatchObject([{ store: null }])
	})
})
