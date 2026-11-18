import { describe, expect, it } from 'vitest'

import { buildSpendingSlices } from '../helpers/spending-slices'

const store = (id: string, total: number) => ({ id, name: id.toUpperCase(), total })

describe('buildSpendingSlices', () => {
	it('adds up to 100 whatever the rounding', () => {
		const slices = buildSpendingSlices([store('a', 1), store('b', 1), store('c', 1)], 3)
		expect(slices.map(slice => slice.percent).reduce((a, b) => a + b, 0)).toBe(100)
	})

	it('puts what the stores do not reach in Other, as a share of the month', () => {
		const slices = buildSpendingSlices([store('metro', 500), store('oxxo', 300)], 1000)
		expect(slices.map(slice => [slice.key, slice.percent])).toEqual([
			['store-0', 50],
			['store-1', 30],
			['other', 20],
		])
		expect(slices.at(-1)).toMatchObject({ name: 'Other', total: 200, storeCount: 0 })
	})

	it('has no Other when the stores are the whole month', () => {
		const slices = buildSpendingSlices([store('a', 60), store('b', 40)], 100)
		expect(slices.map(slice => slice.key)).toEqual(['store-0', 'store-1'])
	})

	it('keeps the largest three and counts the stores that went into Other', () => {
		const slices = buildSpendingSlices([store('a', 10), store('d', 40), store('b', 30), store('c', 20), store('e', 5)], 105)
		expect(slices.map(slice => slice.name)).toEqual(['D', 'B', 'C', 'Other'])
		expect(slices.at(-1)).toMatchObject({ total: 15, storeCount: 2 })
	})

	it('draws nothing for a month with no spend', () => {
		expect(buildSpendingSlices([], 0)).toEqual([])
		expect(buildSpendingSlices([store('a', 0)], 0)).toEqual([])
	})
})
