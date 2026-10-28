import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, TEST_UUID } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const url = (query = '') => new Request(`http://localhost/api/v1/base-list-items${query}`)

function signIn(rpcResults?: Record<string, { data?: unknown; error?: unknown }>) {
	const { supabase } = createSupabaseMock({ rpcResults })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

describe('GET /api/v1/base-list-items?filter=likely_needed', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns the explicit DTO and the history flag', async () => {
		const supabase = signIn({
			likely_needed_items: {
				data: [{
					id: TEST_UUID,
					name: 'Milk',
					base_list_id: TEST_UUID,
					base_list_name: 'Pantry',
					usual_store_id: TEST_UUID,
					usual_store_name: 'Metro',
					interval_days: 9,
					days_since: 12,
					has_history: true,
				}],
				error: null,
			},
		})

		const response = await GET(url('?filter=likely_needed&limit=5'))

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			data: [{
				id: TEST_UUID,
				name: 'Milk',
				base_list: { id: TEST_UUID, name: 'Pantry' },
				usual_store: { id: TEST_UUID, name: 'Metro' },
				interval_days: 9,
				days_since: 12,
			}],
			meta: { limit: 5, has_history: true },
		})
		expect(supabase.rpc).toHaveBeenCalledWith('likely_needed_items', { p_limit: 5 })
	})

	it('defaults limit to five and filters the sentinel row from an empty result', async () => {
		const supabase = signIn({
			likely_needed_items: {
				data: [{
					id: null,
					name: null,
					base_list_id: null,
					base_list_name: null,
					usual_store_id: null,
					usual_store_name: null,
					interval_days: null,
					days_since: null,
					has_history: false,
				}],
				error: null,
			},
		})

		const response = await GET(url('?filter=likely_needed'))

		expect(await response.json()).toEqual({ data: [], meta: { limit: 5, has_history: false } })
		expect(supabase.rpc).toHaveBeenCalledWith('likely_needed_items', { p_limit: 5 })
	})

	it('answers 422 for a missing, unknown or out-of-range filter/limit', async () => {
		const supabase = signIn()

		for (const query of ['', '?filter=active', '?filter=likely_needed&limit=0', '?filter=likely_needed&limit=11']) {
			expect((await GET(url(query))).status).toBe(422)
		}
		expect(supabase.rpc).not.toHaveBeenCalled()
	})

	it('answers 401 when signed out', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await GET(url('?filter=likely_needed'))).status).toBe(401)
	})

	it('returns a safe 500 when the RPC fails', async () => {
		signIn({ likely_needed_items: { data: null, error: { code: 'XX000', message: 'secret query detail' } } })

		const response = await GET(url('?filter=likely_needed'))

		expect(response.status).toBe(500)
		expect(await response.text()).not.toContain('secret query detail')
	})
})
