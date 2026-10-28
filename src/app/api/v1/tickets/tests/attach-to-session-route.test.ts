import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2, TEST_UUID_3 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../[ticketId]/attach-to-session/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const payload = { shopping_session_id: TEST_UUID_2, links: [{ ticket_item_id: TEST_UUID_3, shopping_session_item_id: null }], total_amount: 12.4 }
const result = { completed_now: true, matched_count: 1, checked_now_count: 1, added_count: 0, priced_count: 1, over_limit_count: 0, replayed: false }

function signIn(rpc: { data?: unknown; error?: unknown }) {
	const { supabase } = createSupabaseMock({ rpcResults: { attach_receipt_to_session: rpc } })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

const post = (body: unknown) => POST(new Request(`http://localhost/api/v1/tickets/${TEST_UUID}/attach-to-session`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(body),
}), { params: Promise.resolve({ ticketId: TEST_UUID }) })

describe('POST /api/v1/tickets/:ticketId/attach-to-session', () => {
	let consoleError: ReturnType<typeof vi.spyOn>
	beforeEach(() => {
		vi.clearAllMocks()
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
	})
	afterEach(() => consoleError.mockRestore())

	it('returns the reconciliation summary', async () => {
		const supabase = signIn({ data: [result], error: null })
		const response = await post(payload)
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ data: result })
		expect(supabase.rpc).toHaveBeenCalledWith('attach_receipt_to_session', expect.objectContaining({
			p_ticket_id: TEST_UUID,
			p_session_id: TEST_UUID_2,
			p_total_amount: 12.4,
		}))
	})

	it('returns replay as a successful idempotent response', async () => {
		signIn({ data: [{ ...result, replayed: true, completed_now: false }], error: null })
		const response = await post(payload)
		expect(response.status).toBe(200)
		expect((await response.json()).data.replayed).toBe(true)
	})

	it.each(['RECEIPT_NOT_READ', 'RECEIPT_ATTACHED', 'RECEIPT_ADDED_TO_LIST', 'SESSION_HAS_RECEIPT', 'SESSION_OUT_OF_WINDOW', 'STORE_MISMATCH'])(
		'maps %s to a safe 409 conflict', async reason => {
			signIn({ data: null, error: { code: 'P0001', message: reason, details: TEST_UUID_2 } })
			const response = await post(payload)
			expect(response.status).toBe(409)
			const body = await response.json()
			expect(body.error.details.reason).toBe(reason)
			expect(body.error.details.shopping_session_id).toBe(TEST_UUID_2)
			expect(JSON.stringify(body)).not.toContain('database')
		},
	)

	it('rejects invalid bodies and unknown write fields before the RPC', async () => {
		const supabase = signIn({ data: null, error: null })
		expect((await post({ ...payload, total_amount: -1 })).status).toBe(422)
		expect((await post({ ...payload, unexpected: true })).status).toBe(422)
		expect(supabase.rpc).not.toHaveBeenCalled()
	})

	it('returns 404 for an invisible session and 401 when signed out', async () => {
		signIn({ data: null, error: { code: 'P0002', message: 'not exposed' } })
		expect((await post(payload)).status).toBe(404)
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await post(payload)).status).toBe(401)
	})
})
