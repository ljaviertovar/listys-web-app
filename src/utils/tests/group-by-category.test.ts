import { describe, expect, it } from 'vitest'

import { groupByCategory } from '@/utils/group-by-category'

describe('groupByCategory', () => {
	it('groups by normalised category, sorted by name, with the uncategorised ones under Other', () => {
		const groups = groupByCategory([
			{ id: 'a', category: '27 PRODUCE' },
			{ id: 'b', category: 'dairy' },
			{ id: 'c', category: null },
			{ id: 'd', category: 'Produce' },
			{ id: 'e' },
		])

		expect(groups.map(g => g.key)).toEqual(['Dairy', 'Other', 'Produce'])
		expect(groups.find(g => g.key === 'Produce')?.items.map(i => i.id)).toEqual(['a', 'd'])
		expect(groups.find(g => g.key === 'Other')?.items.map(i => i.id)).toEqual(['c', 'e'])
	})

	it('keeps the order of the items inside a category', () => {
		const groups = groupByCategory([
			{ id: '2', category: 'Dairy' },
			{ id: '1', category: 'Dairy' },
		])

		expect(groups[0].items.map(i => i.id)).toEqual(['2', '1'])
	})
})
