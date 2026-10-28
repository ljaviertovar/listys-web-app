import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[ticketId]/session-matches/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(rpc: { data?: unknown; error?: unknown }) {
	const { supabase } = createSupabaseMock({ rpcResults: { ticket_session_matches: rpc } })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

const get = (query: string) => GET(new Request(`http://localhost/api/v1/tickets/${TEST_UUID}/session-matches${query}`), {
	params: Promise.resolve({ ticketId: TEST_UUID }),
})

describe('GET /api/v1/tickets/:ticketId/session-matches', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns matches for the selected trip', async () => {
		const supabase = signIn({ data: [{ ticket_item_id: TEST_UUID_2, match_kind: 'name', shopping_session_item_id: TEST_UUID, shopping_session_item_name: 'Milk', checked: false }], error: null })
		const response = await get(`?shopping_session_id=${TEST_UUID}`)
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ data: [{
			ticket_item_id: TEST_UUID_2,
			match: 'name',
			shopping_session_item: { id: TEST_UUID, name: 'Milk', checked: false },
		}] })
		expect(supabase.rpc).toHaveBeenCalledWith('ticket_session_matches', { p_ticket_id: TEST_UUID, p_session_id: TEST_UUID })
	})

	it('rejects missing, malformed and unknown query fields before the RPC', async () => {
		const supabase = signIn({ data: [], error: null })
		expect((await get('')).status).toBe(422)
		expect((await get('?shopping_session_id=bad')).status).toBe(422)
		expect((await get(`?shopping_session_id=${TEST_UUID}&extra=x`)).status).toBe(422)
		expect(supabase.rpc).not.toHaveBeenCalled()
	})

	it('returns 404 for a foreign session', async () => {
		signIn({ data: null, error: { code: 'P0002', message: 'Ticket or shopping session not found' } })
		expect((await get(`?shopping_session_id=${TEST_UUID}`)).status).toBe(404)
	})

	it('returns 401 when signed out', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await get(`?shopping_session_id=${TEST_UUID}`)).status).toBe(401)
	})
})
