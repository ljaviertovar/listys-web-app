import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, TEST_UUID } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[ticketId]/session-candidates/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const candidate = {
	id: TEST_UUID,
	name: 'Saturday shop',
	status: 'active',
	started_at: '2026-10-27T12:00:00Z',
	completed_at: null,
	store_id: null,
	store_name: null,
	base_list_id: '00000001-0000-4000-a000-000000000001',
	base_list_name: 'Pantry',
	checked_count: 2,
	item_count: 4,
}

function signIn(rpc: { data?: unknown; error?: unknown }) {
	const { supabase } = createSupabaseMock({ rpcResults: { ticket_session_candidates: rpc } })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

const get = () => GET(new Request(`http://localhost/api/v1/tickets/${TEST_UUID}/session-candidates`), {
	params: Promise.resolve({ ticketId: TEST_UUID }),
})

describe('GET /api/v1/tickets/:ticketId/session-candidates', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns explicitly mapped candidates', async () => {
		const supabase = signIn({ data: [candidate], error: null })
		const response = await get()
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ data: [{
			id: TEST_UUID,
			name: 'Saturday shop',
			status: 'active',
			started_at: candidate.started_at,
			completed_at: null,
			store: null,
			base_list: { id: candidate.base_list_id, name: 'Pantry' },
			checked_count: 2,
			item_count: 4,
		}] })
		expect(supabase.rpc).toHaveBeenCalledWith('ticket_session_candidates', { p_ticket_id: TEST_UUID })
	})

	it('returns 401 when signed out', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await get()).status).toBe(401)
	})
})
