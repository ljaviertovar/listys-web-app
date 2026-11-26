import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createSupabaseMock, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { PATCH } from '../[baseListId]/items/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(tables: Parameters<typeof createSupabaseMock>[0] = {}) {
	const mock = createSupabaseMock(tables)
	mockedAuth.mockResolvedValue({ supabase: mock.supabase, user: { id: 'user-1' } } as never)
	return mock
}

const patch = (body: unknown) =>
	PATCH(
		new Request(`http://localhost/api/v1/base-lists/${TEST_UUID}/items`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}),
		{ params: Promise.resolve({ baseListId: TEST_UUID }) },
	)

const checkOne = { changes: [{ item_id: TEST_UUID_2, needed: true }] }

const visibleList = { base_lists: { data: { id: TEST_UUID }, error: null } }

describe('PATCH /api/v1/base-lists/{baseListId}/items', () => {
	beforeEach(() => vi.clearAllMocks())

	it('checks the items of that list and reports how many changed', async () => {
		const { fromMocks } = signIn({ tables: { ...visibleList, base_list_items: { data: [{ id: TEST_UUID_2 }], error: null } } })

		const response = await patch(checkOne)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ data: { updated: 1 } })
		expect(fromMocks.base_list_items.update).toHaveBeenCalledWith({ needed_at: expect.any(String) })
		expect(fromMocks.base_list_items.eq).toHaveBeenCalledWith('base_list_id', TEST_UUID)
		expect(fromMocks.base_list_items.is).toHaveBeenCalledWith('needed_at', null)
	})

	it('checks and unchecks in the same request', async () => {
		const { fromMocks } = signIn({ tables: { ...visibleList, base_list_items: { data: [], error: null } } })

		const response = await patch({ changes: [{ item_id: TEST_UUID_2, needed: true }, { item_id: TEST_UUID, needed: false }] })

		expect(response.status).toBe(200)
		expect(fromMocks.base_list_items.update.mock.calls).toEqual([[{ needed_at: expect.any(String) }], [{ needed_at: null }]])
		expect(fromMocks.base_list_items.in.mock.calls).toEqual([['id', [TEST_UUID_2]], ['id', [TEST_UUID]]])
	})

	it.each([
		['no changes', { changes: [] }],
		['too many changes', { changes: Array.from({ length: 251 }, (_, index) => ({ item_id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, needed: true })) }],
		['an invalid id', { changes: [{ item_id: 'nope', needed: true }] }],
		['a repeated item', { changes: [{ item_id: TEST_UUID_2, needed: true }, { item_id: TEST_UUID_2, needed: false }] }],
		['a client date', { changes: [{ item_id: TEST_UUID_2, needed: true, needed_at: '2020-01-01' }] }],
	])('rejects %s without writing', async (_label, body) => {
		const { supabase } = signIn({ tables: visibleList })

		const response = await patch(body)

		expect(response.status).toBeGreaterThanOrEqual(400)
		expect(response.status).toBeLessThan(500)
		expect(supabase.from).not.toHaveBeenCalled()
	})

	it('answers 404 for a list the caller cannot see', async () => {
		signIn({ tables: { base_lists: { data: null, error: null } } })

		expect((await patch(checkOne)).status).toBe(404)
	})

	it('does not expose database errors', async () => {
		signIn({ tables: { ...visibleList, base_list_items: { data: null, error: { code: 'XX000', message: 'private detail' } } } })
		vi.spyOn(console, 'error').mockImplementation(() => {})

		const response = await patch(checkOne)

		expect(response.status).toBe(500)
		expect(JSON.stringify(await response.json())).not.toContain('private detail')
	})

	it('requires a session', async () => {
		mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

		expect((await patch(checkOne)).status).toBe(401)
	})
})
