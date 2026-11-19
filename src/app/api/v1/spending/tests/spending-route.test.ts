import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryBuilder, createSupabaseMock, sequentialFrom } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '@/app/api/v1/spending/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const from = '2026-10-01T00:00:00Z'
const to = '2026-10-29T00:00:00Z'
const request = (query: string) => new Request(`http://localhost/api/v1/spending${query}`)

function signIn(rpc?: { data?: unknown; error?: unknown }, tables?: Parameters<typeof createSupabaseMock>[0] extends infer O ? (O extends { tables?: infer T } ? T : never) : never) {
	const { supabase } = createSupabaseMock({ tables, rpcResults: { spending_summary_by_purchase_date: rpc ?? {
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
		expect(supabase.rpc).toHaveBeenCalledWith('spending_summary_by_purchase_date', { p_from: from, p_to: to, p_purchase_from: '2026-10-01', p_purchase_to: '2026-10-29', p_time_zone: 'UTC' })
	})

	it('applies local purchase days and upload instants to current and comparison receipt queries', async () => {
		const supabase = signIn(undefined, { shopping_sessions: { data: [{ id: 'trip' }] } })
		const query = new URLSearchParams({
			from: '2026-11-01T04:00:00Z',
			to: '2026-12-01T05:00:00Z',
			compare_from: '2026-10-01T04:00:00Z',
			compare_to: '2026-11-01T04:00:00Z',
			time_zone: 'America/Toronto',
		})
		const response = await GET(request(`?${query}`))
		expect(response.status).toBe(200)
		expect(supabase.rpc).toHaveBeenCalledWith('spending_summary_by_purchase_date', expect.objectContaining({
			p_purchase_from: '2026-11-01',
			p_purchase_to: '2026-12-01',
			p_time_zone: 'America/Toronto',
		}))
		const tickets = supabase.from('tickets')
		const filters = tickets.or.mock.calls.map(([filter]: [string]) => filter)
		const current = 'and(purchase_date.gte.2026-11-01,purchase_date.lt.2026-12-01),and(purchase_date.is.null,created_at.gte.2026-11-01T04:00:00.000Z,created_at.lt.2026-12-01T05:00:00.000Z)'
		const previous = 'and(purchase_date.gte.2026-10-01,purchase_date.lt.2026-11-01),and(purchase_date.is.null,created_at.gte.2026-10-01T04:00:00.000Z,created_at.lt.2026-11-01T04:00:00.000Z)'
		expect(filters.sort()).toEqual([...Array(4).fill(current), ...Array(3).fill(previous)].sort())
	})

	it('returns 422 for missing values, datetimes without offsets, reversed dates, and ranges over 92 days', async () => {
		signIn()
		const invalidQueries = [
			'',
			`?from=2026-10-01T00%3A00%3A00&to=${encodeURIComponent(to)}`,
			`?from=${encodeURIComponent('2026-10-01T00:00:00+99:99')}&to=${encodeURIComponent(to)}`,
			`?from=${encodeURIComponent(to)}&to=${encodeURIComponent(from)}`,
			`?from=${encodeURIComponent(from)}&to=2027-01-02T00%3A00%3A00Z`,
			`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&time_zone=Mars%2FOlympus`,
		]
		for (const query of invalidQueries) expect((await GET(request(query))).status).toBe(422)
	})

	it('returns 401 for signed-out callers', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
		expect((await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))).status).toBe(401)
	})

	it('keeps the receipt-backed chart available when the RPC and purchase-date column are unavailable', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const { supabase } = createSupabaseMock({
			rpcResults: { spending_summary_by_purchase_date: { data: null, error: { code: '42883', message: 'private database detail' } } },
			tables: { shopping_sessions: { data: [], error: null } },
		})
		const originalFrom = supabase.from
		supabase.from = vi.fn().mockImplementation((table: string) => {
			if (table !== 'tickets') return originalFrom(table)
			const builder = createQueryBuilder({ data: [{ id: 'standalone', total_amount: 84.5, store: null }], error: null })
			builder.or.mockImplementation((filter: string) => {
				if (filter.includes('purchase_date')) builder._result = { data: null, error: { code: '42703', message: 'private database detail' } }
				return builder
			})
			builder.then = vi.fn((resolve: (result: unknown) => unknown) => resolve(builder._result))
			builder.maybeSingle.mockResolvedValue({ data: { created_at: from }, error: null })
			return builder
		})
		mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))
		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({
			data: { total: 84.5, receipts_count: 1, receipt_total: 84.5, receipt_count: 1 },
		})
	})
})

describe('GET /api/v1/spending store breakdown', () => {
	beforeEach(() => vi.clearAllMocks())

	it.each([`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, '?scope=all'])(
		'counts receipts from both trips before and after review in %s',
		async query => {
			const supabase = signIn()
			const empty = { data: [], error: null }
			supabase.from = sequentialFrom({
				shopping_sessions: [empty, { data: [{ id: 'trip-1' }, { id: 'trip-2' }], error: null }],
				tickets: [empty, empty, empty, {
					data: [
						{ id: 'standalone', total_amount: 10, store: null },
						{ id: 'known', total_amount: 63, store: null },
					],
					error: null,
				}, {
					data: [
						{ id: 'pending-1', total_amount: 15, store: null },
						{ id: 'pending-2', total_amount: 25, store: null },
						{ id: 'no-total', total_amount: null, store: null },
						{ id: 'known', total_amount: 63, store: null },
					],
					error: null,
				}, {
					data: [
						{ id: 'known', total_amount: 63, attached_total_amount: 60, store: { id: 's1', name: 'Metro' } },
						{ id: 'second-trip-receipt', attached_total_amount: 40, store: null },
					],
					error: null,
				}],
				ticket_items: [{
					data: [
						{ ticket_id: 'known', price: 60, quantity: 1 },
					],
					error: null,
				}],
			})
			const response = await GET(request(query))

			expect(response.status).toBe(200)
			expect((await response.json()).data).toMatchObject({
				receipt_total: 150,
				receipt_count: 5,
				receipt_unknown_store_total: 90,
				receipt_stores: [{ id: 's1', name: 'Metro', total: 60 }],
			})
		},
	)

	it('splits multi-store trip totals by attached receipt and includes trips without receipts', async () => {
		const { supabase } = createSupabaseMock({ rpcResults: { spending_summary_by_purchase_date: {
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
		const { supabase } = createSupabaseMock({
			rpcResults: { spending_summary_by_purchase_date: { data: [{ receipts_count: 2, total: 125.75, trips_count: 3, trips_without_total: 1 }], error: null } },
		})
		supabase.from = sequentialFrom({
			shopping_sessions: [
					{ data: null, error: { code: 'XX000', message: 'private' } },
					{ data: [], error: null },
			],
			tickets: [{ data: [], error: null }],
		})
		mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)

		const response = await GET(request(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))

		expect(response.status).toBe(200)
		expect((await response.json()).data).toMatchObject({ total: 125.75, stores: [] })
	})
})

describe('GET /api/v1/spending all time', () => {
	beforeEach(() => vi.clearAllMocks())

	it('reads every receipt with no dates, so the 92-day bound does not apply', async () => {
		const supabase = signIn()
		const response = await GET(request('?scope=all'))

		expect(response.status).toBe(200)
		const [name, args] = supabase.rpc.mock.calls[0]
		expect(name).toBe('spending_summary_by_purchase_date')
		expect(args).toMatchObject({ p_purchase_from: null, p_purchase_to: null })
		expect(supabase.from('tickets').or).not.toHaveBeenCalled()
		expect(Date.parse(args.p_from)).toBe(0)
		expect(Date.parse(args.p_to)).toBeGreaterThan(Date.now())
		expect((await response.json()).data.change_percent).toBeNull()
	})

	it('rejects a scope that comes with dates, or one that is not all', async () => {
		signIn()
		expect((await GET(request(`?scope=all&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))).status).toBe(422)
		expect((await GET(request('?scope=week'))).status).toBe(422)
	})
})

describe('GET /api/v1/spending first receipt', () => {
	beforeEach(() => vi.clearAllMocks())

	function signInWithFirstReceipt(first: { data?: unknown; error?: unknown }) {
		const { supabase } = createSupabaseMock({ rpcResults: { spending_summary_by_purchase_date: { data: [{ receipts_count: 1, total: 10, trips_count: 0, trips_without_total: 0 }], error: null } } })
		const tickets = createQueryBuilder({ data: [], error: null })
		tickets.maybeSingle.mockResolvedValue(first)
		supabase.from = vi.fn().mockImplementation((table: string) => (table === 'tickets' ? tickets : createQueryBuilder({ data: [], error: null })))
		mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
		return tickets
	}
	const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

	it('reports when the oldest receipt of the user was added, whatever the range', async () => {
		const tickets = signInWithFirstReceipt({ data: { created_at: '2026-03-04T10:00:00Z' }, error: null })

		const { data } = await (await GET(request(query))).json()

		expect(data.first_receipt_at).toBe('2026-03-04T10:00:00Z')
		expect(tickets.order).toHaveBeenCalledWith('created_at', { ascending: true })
	})

	it('answers without it when there is no receipt or it cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		signInWithFirstReceipt({ data: null, error: null })
		expect((await (await GET(request(query))).json()).data.first_receipt_at).toBeNull()

		signInWithFirstReceipt({ data: null, error: { code: 'XX000', message: 'private' } })
		const response = await GET(request(query))
		expect(response.status).toBe(200)
		expect((await response.json()).data.first_receipt_at).toBeNull()
	})
})

describe('GET /api/v1/spending last receipt', () => {
	beforeEach(() => vi.clearAllMocks())

	function signInWithEdges(first: { data?: unknown; error?: unknown }, last: { data?: unknown; error?: unknown }) {
		const { supabase } = createSupabaseMock({ rpcResults: { spending_summary_by_purchase_date: { data: [{ receipts_count: 0, total: 0, trips_count: 0, trips_without_total: 0 }], error: null } } })
		const tickets = createQueryBuilder({ data: [], error: null })
		tickets.maybeSingle.mockResolvedValueOnce(first).mockResolvedValueOnce(last)
		supabase.from = vi.fn().mockImplementation((table: string) => (table === 'tickets' ? tickets : createQueryBuilder({ data: [], error: null })))
		mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
		return tickets
	}
	const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

	it('reports when the newest receipt was added, apart from the oldest', async () => {
		const tickets = signInWithEdges({ data: { created_at: '2026-03-04T10:00:00Z' }, error: null }, { data: { created_at: '2026-10-28T10:00:00Z' }, error: null })

		const { data } = await (await GET(request(query))).json()

		expect(data.first_receipt_at).toBe('2026-03-04T10:00:00Z')
		expect(data.last_receipt_at).toBe('2026-10-28T10:00:00Z')
		expect(tickets.order).toHaveBeenCalledWith('created_at', { ascending: false })
	})

	it('answers without it when there is no receipt or it cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		signInWithEdges({ data: null, error: null }, { data: null, error: null })
		expect((await (await GET(request(query))).json()).data.last_receipt_at).toBeNull()

		signInWithEdges({ data: null, error: null }, { data: null, error: { code: 'XX000', message: 'private' } })
		const response = await GET(request(query))
		expect(response.status).toBe(200)
		expect((await response.json()).data.last_receipt_at).toBeNull()
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
