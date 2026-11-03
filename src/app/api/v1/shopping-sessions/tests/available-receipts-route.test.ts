import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2, TEST_UUID_3 } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET } from '../[sessionId]/available-receipts/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

type Session = { id: string; status: 'active' | 'completed'; store_id: string | null } | null
const receipt = (overrides: Record<string, unknown> = {}) => ({
	id: TEST_UUID_2,
	created_at: '2026-11-02T12:00:00Z',
	total_amount: 42.5,
	total_items: 7,
	store_id: null,
	store: null,
	...overrides,
})

function signIn(session: Session, tickets: unknown[] | null = [receipt()], ticketsError: unknown = null) {
	const { supabase, fromMocks } = createSupabaseMock({
		tables: {
			shopping_sessions: { data: session, error: null },
			tickets: { data: tickets, error: ticketsError },
		},
	})
	mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
	return { supabase, fromMocks }
}

const get = (sessionId = TEST_UUID) =>
	GET(new Request(`http://localhost/api/v1/shopping-sessions/${sessionId}/available-receipts`), {
		params: Promise.resolve({ sessionId }),
	})

describe('GET /api/v1/shopping-sessions/:sessionId/available-receipts', () => {
	beforeEach(() => vi.clearAllMocks())

	it('answers 404 for a trip the caller does not own, without reading any receipt', async () => {
		const { supabase } = signIn(null)
		const response = await get()
		expect(response.status).toBe(404)
		expect(supabase.from).not.toHaveBeenCalledWith('tickets')
	})

	it('rejects a malformed trip id before reading anything', async () => {
		const { supabase } = signIn({ id: TEST_UUID, status: 'completed', store_id: null })
		const response = await get('not-a-uuid')
		expect(response.status).toBeGreaterThanOrEqual(400)
		expect(response.status).toBeLessThan(500)
		expect(supabase.from).not.toHaveBeenCalled()
	})

	it('only asks for read, unattached, not-in-a-list receipts of the owner that came from this trip or from none', async () => {
		const { fromMocks } = signIn({ id: TEST_UUID, status: 'completed', store_id: null })
		await get()
		const tickets = fromMocks.tickets
		expect(tickets.eq).toHaveBeenCalledWith('user_id', 'user-1')
		expect(tickets.eq).toHaveBeenCalledWith('ocr_status', 'completed')
		expect(tickets.is).toHaveBeenCalledWith('shopping_session_id', null)
		expect(tickets.is).toHaveBeenCalledWith('base_list_id', null)
		expect(tickets.or).toHaveBeenCalledWith(`uploaded_from_session_id.is.null,uploaded_from_session_id.eq.${TEST_UUID}`)
		expect(tickets.order).toHaveBeenCalledWith('created_at', { ascending: false })
		expect(tickets.limit).toHaveBeenCalledWith(50)
	})

	it('returns explicit fields for each receipt', async () => {
		signIn({ id: TEST_UUID, status: 'completed', store_id: TEST_UUID_3 }, [
			receipt({ store_id: TEST_UUID_3, store: { id: TEST_UUID_3, name: 'Metro', extra: 'ignored' } }),
		])
		const response = await get()
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			data: [
				{
					id: TEST_UUID_2,
					created_at: '2026-11-02T12:00:00Z',
					store: { id: TEST_UUID_3, name: 'Metro' },
					total_amount: 42.5,
					item_count: 7,
					selectable: true,
					reason: null,
				},
			],
		})
	})

	it.each([
		['a completed trip at another store', { status: 'completed', store_id: TEST_UUID }, TEST_UUID_3, false],
		['a completed trip at the same store', { status: 'completed', store_id: TEST_UUID_3 }, TEST_UUID_3, true],
		['a completed trip with no store', { status: 'completed', store_id: null }, TEST_UUID_3, true],
		['an active trip at another store (the receipt store wins)', { status: 'active', store_id: TEST_UUID }, TEST_UUID_3, true],
		['a receipt without a confirmed store', { status: 'completed', store_id: TEST_UUID }, null, true],
	] as const)('marks the receipt for %s', async (_label, session, receiptStore, selectable) => {
		signIn({ id: TEST_UUID, ...session }, [receipt({ store_id: receiptStore })])
		const body = await (await get()).json()
		expect(body.data[0].selectable).toBe(selectable)
		expect(body.data[0].reason).toBe(selectable ? null : 'STORE_MISMATCH')
	})

	it('returns an empty list when nothing is available', async () => {
		signIn({ id: TEST_UUID, status: 'completed', store_id: null }, [])
		expect(await (await get()).json()).toEqual({ data: [] })
	})

	it('hides database details when the receipts cannot be read', async () => {
		signIn({ id: TEST_UUID, status: 'completed', store_id: null }, null, { code: 'XX000', message: 'secret internal detail' })
		const response = await get()
		expect(response.status).toBe(500)
		expect(JSON.stringify(await response.json())).not.toContain('secret internal detail')
	})
})
