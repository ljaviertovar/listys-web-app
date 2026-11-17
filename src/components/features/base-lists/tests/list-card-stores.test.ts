import { describe, expect, it } from 'vitest'

import { groupStoresByList, splitCardStores } from '../helpers/list-card-stores'

const row = (listId: string, id: string | null, name = id ?? '') => ({ base_list_id: listId, store: id ? { id, name } : null })

describe('groupStoresByList', () => {
	it('lists each store of a list once, the one with the most items first', () => {
		const grouped = groupStoresByList([
			row('l1', 'metro', 'Metro'),
			row('l1', 'costco', 'Costco'),
			row('l1', 'costco', 'Costco'),
			row('l1', 'metro', 'Metro'),
			row('l1', 'costco', 'Costco'),
		])

		expect(grouped.l1.map(store => store.name)).toEqual(['Costco', 'Metro'])
	})

	it('breaks ties alphabetically so the card does not reshuffle between renders', () => {
		const grouped = groupStoresByList([row('l1', 'b', 'Walmart'), row('l1', 'a', 'Metro')])

		expect(grouped.l1.map(store => store.name)).toEqual(['Metro', 'Walmart'])
	})

	it('keeps each list to its own stores and skips items with no usual store', () => {
		const grouped = groupStoresByList([row('l1', 'metro', 'Metro'), row('l2', 'costco', 'Costco'), row('l2', null), row('l3', null)])

		expect(grouped.l1.map(store => store.name)).toEqual(['Metro'])
		expect(grouped.l2.map(store => store.name)).toEqual(['Costco'])
		expect(grouped.l3).toBeUndefined()
	})

	it('ignores a store whose name is blank', () => {
		expect(groupStoresByList([row('l1', 's1', '   ')])).toEqual({})
	})
})

describe('splitCardStores', () => {
	const stores = ['A', 'B', 'C', 'D'].map(name => ({ id: name, name }))

	it('shows two stores and counts the rest', () => {
		const { shown, hiddenCount } = splitCardStores(stores)

		expect(shown.map(store => store.name)).toEqual(['A', 'B'])
		expect(hiddenCount).toBe(2)
	})

	it('has nothing hidden when the stores fit', () => {
		expect(splitCardStores(stores.slice(0, 2))).toEqual({ shown: stores.slice(0, 2), hiddenCount: 0 })
		expect(splitCardStores([])).toEqual({ shown: [], hiddenCount: 0 })
	})
})
