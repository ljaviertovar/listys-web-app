import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, sequentialFrom } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '@/app/api/v1/spending/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const from = '2026-10-01T00:00:00Z'
const to = '2026-10-29T00:00:00Z'
const request = (query: string) => new Request(`http://localhost/api/v1/spending${query}`)

function signIn(rpc?: { data?: unknown; error?: unknown }, tables?: Parameters<typeof createSupabaseMock>[0] extends infer O ? (O extends { tables?: infer T } ? T : never) : never) {
	const { supabase } = createSupabaseMock({ tables, rpcResults: { spending_summary: rpc ?? {
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

describe('GET /api/v1/spending store breakdown', () => {
	beforeEach(() => vi.clearAllMocks())

	it('splits multi-store trip totals by attached receipt and includes trips without receipts', async () => {
		const { supabase } = createSupabaseMock({ rpcResults: { spending_summary: {
			data: [{ receipts_count: 2, total: 229.65, trips_count: 2, trips_without_total: 0 }], error: null,
		} } })
		supabase.from = sequentialFrom({
			shopping_sessions: [{ data: [
				{ id: 'trip-1', total_amount: 173.43, store: { id: 's1', name: 'Metro' } },
				{ id: 'trip-2', total_amount: 41.12, store: { id: 's2', name: 'Costco' } },
			], error: null }],
			tickets: [
				{ data: [
					{ total_amount: 10.1, store: { id: 's2', name: 'Costco' } },
					{ total_amount: null, store: { id: 's1', name: 'Metro' } },
					{ total_amount: 5, store: null },
				], error: null },
				{ data: [
					{ shopping_session_id: 'trip-1', attached_total_amount: 84.5, total_amount: 84.5, store: { id: 's1', name: 'Metro' } },
					{ shopping_session_id: 'trip-1', attached_total_amount: 88.93, total_amount: 88.93, store: { id: 's3', name: 'Walmart' } },
			], error: null },
			],
		})
		mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)

		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))
		const { data } = await response.json()

		expect(data.stores).toEqual([
			{ id: 's3', name: 'Walmart', total: 88.93 },
			{ id: 's1', name: 'Metro', total: 84.5 },
			{ id: 's2', name: 'Costco', total: 51.22 },
		])
		expect(data.total).toBe(229.65)
	})

	it('still answers with the total when the breakdown cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		signIn(undefined, { shopping_sessions: { data: null, error: { code: 'XX000', message: 'private' } } })

		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))

		expect(response.status).toBe(200)
		expect((await response.json()).data).toMatchObject({ total: 125.75, stores: [] })
	})
})

describe('GET /api/v1/spending other total', () => {
	beforeEach(() => vi.clearAllMocks())

	it('reports what the total holds beyond the listed stores, such as receipts without a confirmed store', async () => {
		signIn(undefined, { shopping_sessions: { data: [{ id: 'trip-1', total_amount: 100, store: { id: 's1', name: 'No Frills' } }], error: null }, tickets: { data: [], error: null } })

		const { data } = await (await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))).json()

		expect(data.stores).toEqual([{ id: 's1', name: 'No Frills', total: 100 }])
		expect(data.other_total).toBe(25.75)
	})
})
