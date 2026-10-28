import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '@/app/api/v1/spending/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const from = '2026-10-01T00:00:00Z'
const to = '2026-10-29T00:00:00Z'
const request = (query: string) => new Request(`http://localhost/api/v1/spending${query}`)

function signIn(rpc?: { data?: unknown; error?: unknown }) {
	const { supabase } = createSupabaseMock({ rpcResults: { spending_summary: rpc ?? {
		data: [{ receipts_count: 2, total: 125.75, trips_count: 3, trips_without_total: 1 }], error: null,
	} } })
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return supabase
}

describe('GET /api/v1/spending', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns the spending summary and uses the bounded range', async () => {
		const supabase = signIn()
		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))

		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({ data: { from, to, receipts_count: 2, total: 125.75, trips_count: 3, trips_without_total: 1 } })
		expect(supabase.rpc).toHaveBeenCalledWith('spending_summary', { p_from: from, p_to: to })
	})

	it('returns 422 for missing values, datetimes without offsets, reversed dates, and ranges over 92 days', async () => {
		signIn()
		const invalidQueries = [
			'',
			`?from=2026-10-01T00%3A00%3A00&to=${encodeURIComponent(to)}`,
			`?from=${encodeURIComponent(to)}&to=${encodeURIComponent(from)}`,
			`?from=${encodeURIComponent(from)}&to=2027-01-02T00%3A00%3A00Z`,
		]
		for (const query of invalidQueries) expect((await GET(request(query))).status).toBe(422)
	})

	it('returns 401 for signed-out callers', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))).status).toBe(401)
	})

	it('returns a safe 500 when the RPC fails', async () => {
		signIn({ data: null, error: { code: 'XX000', message: 'private database detail' } })
		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))
		expect(response.status).toBe(500)
		expect(await response.text()).not.toContain('private database detail')
	})
})
