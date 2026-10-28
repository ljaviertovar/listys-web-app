import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { getBaseList } from '../base-lists.service'

const auth = vi.mocked(createAuthenticatedClient)

describe('getBaseList store price DTO', () => {
	beforeEach(() => vi.clearAllMocks())

	it('maps only recorded prices to the additive store_prices field', async () => {
		const query = {
			select: vi.fn(), eq: vi.fn(), single: vi.fn(),
		}
		query.select.mockReturnValue(query)
		query.eq.mockReturnValue(query)
		query.single.mockResolvedValue({
			data: {
				id: 'list-1', user_id: 'owner-1', collaborators: [],
				items: [{
					id: 'item-1', name: 'Milk', average_price: 4,
					usual_store: { id: 'store-1', name: 'Market' }, usual_store_source: 'auto',
					store_stats: [
						{ store_id: 'store-1', purchase_count: 2, last_purchased_at: '2026-03-01', last_price: 5.49, last_quantity: 2, last_unit: 'each', last_price_at: '2026-03-01', store: { id: 'store-1', name: 'Market' } },
						{ store_id: 'store-2', purchase_count: 1, last_purchased_at: '2026-02-01', last_price: null, last_quantity: null, last_unit: null, last_price_at: null, store: { id: 'store-2', name: 'Other' } },
					],
				}],
			}, error: null,
		})
		auth.mockResolvedValue({ supabase: { from: vi.fn().mockReturnValue(query) }, user: { id: 'owner-1' } } as never)

		const list = await getBaseList('list-1')

		expect(query.select).toHaveBeenCalledWith(expect.stringContaining('last_quantity, last_unit, last_price_at'))
		expect(list.items[0].store_prices).toEqual([{
			store: { id: 'store-1', name: 'Market' },
			last_price: 5.49,
			last_quantity: 2,
			last_unit: 'each',
			last_price_at: '2026-03-01',
		}])
	})

	it('does not expose statistics hidden by RLS for collaborators', async () => {
		const query = { select: vi.fn(), eq: vi.fn(), single: vi.fn() }
		query.select.mockReturnValue(query)
		query.eq.mockReturnValue(query)
		query.single.mockResolvedValue({
			data: { id: 'list-1', user_id: 'owner-1', collaborators: [], items: [{ id: 'item-1', store_stats: [{ store: null, last_price: 7 }] }] },
			error: null,
		})
		auth.mockResolvedValue({ supabase: { from: vi.fn().mockReturnValue(query) }, user: { id: 'collaborator-1' } } as never)

		const list = await getBaseList('list-1')
		expect(list.items[0].store_prices).toEqual([])
	})
})
