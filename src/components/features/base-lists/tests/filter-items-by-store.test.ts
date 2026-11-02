import { describe, expect, it } from 'vitest'

import {
	NO_USUAL_STORE,
	buildStoreFilterOptions,
	filterItemsByUsualStore,
	resolveStoreFilter,
} from '../items/helpers/filter-items-by-store'

const tagged = (storeId: string, name: string) => ({ usual_store: { id: storeId, name, source: 'auto' as const } })
const untagged = { usual_store: null }

describe('store filter of a list', () => {
	const items = [tagged('nf', 'No Frills'), tagged('nf', 'No Frills'), tagged('co', 'Costco'), untagged]

	it('offers each usual store with its items, the busiest first, and the items without one', () => {
		expect(buildStoreFilterOptions(items)).toEqual([
			{ value: 'nf', label: 'No Frills', count: 2 },
			{ value: 'co', label: 'Costco', count: 1 },
			{ value: NO_USUAL_STORE, label: 'No Usual Store', count: 1 },
		])
	})

	it('offers nothing while no item has a usual store', () => {
		expect(buildStoreFilterOptions([untagged, untagged])).toEqual([])
	})

	it('narrows to one store or to the items without one', () => {
		expect(filterItemsByUsualStore(items, 'nf')).toHaveLength(2)
		expect(filterItemsByUsualStore(items, NO_USUAL_STORE)).toEqual([untagged])
		expect(filterItemsByUsualStore(items, null)).toBe(items)
	})

	it('ignores a store the list has no items for, so an old link still shows the list', () => {
		expect(resolveStoreFilter(items, 'gone')).toBeNull()
		expect(resolveStoreFilter(items, 'co')).toBe('co')
		expect(resolveStoreFilter(items, undefined)).toBeNull()
	})
})
