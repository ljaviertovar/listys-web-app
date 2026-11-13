import { describe, expect, it } from 'vitest'

import type { BaseListItemWithStoreSummary } from '@/types'

import { itemsForStore, summarizeItemsByStore } from '../items/helpers/store-session-summary'

const item = (id: string, usualStoreId: string | null, otherStoreIds: string[] = []): BaseListItemWithStoreSummary => ({
	id,
	usual_store: usualStoreId ? { id: usualStoreId, name: usualStoreId, source: 'manual' } : null,
	other_stores: otherStoreIds.map(storeId => ({ id: storeId, name: storeId, purchase_count: 1 })),
} as BaseListItemWithStoreSummary)

describe('shopping session usual-store items', () => {
	it('counts receipt stores too, and leaves items without store history unassigned', () => {
		const items = [item('milk', 'metro', ['costco']), item('bread', 'metro'), item('soda', null, ['metro'])]

		expect(summarizeItemsByStore(items)).toEqual({ counts: { metro: 3, costco: 1 }, unassignedCount: 0 })
		expect(itemsForStore(items, 'metro').map(entry => entry.id)).toEqual(['milk', 'bread', 'soda'])
	})
})
