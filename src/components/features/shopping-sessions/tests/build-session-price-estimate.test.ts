import { describe, expect, it } from 'vitest'

import { buildSessionPriceEstimate } from '../helpers/build-session-price-estimate'

const item = (id: string, normalized_name: string | null) => ({ id, normalized_name })
const base = (normalized_name: string | null, average_price: number | null) => ({ normalized_name, average_price })

describe('buildSessionPriceEstimate', () => {
	it('has no priced items when the list holds no price data', () => {
		const estimate = buildSessionPriceEstimate([item('a', 'milk'), item('b', 'bread')], [base('milk', null), base('bread', null)])

		expect(estimate).toMatchObject({ total: 0, pricedCount: 0, itemCount: 2 })
		expect(estimate.priceByItemId.size).toBe(0)
	})

	it('adds the known averages and counts how many items are covered', () => {
		const estimate = buildSessionPriceEstimate(
			[item('a', 'milk'), item('b', 'bread'), item('c', 'eggs')],
			[base('milk', 3.5), base('bread', null), base('eggs', 4.25)],
		)

		expect(estimate.total).toBeCloseTo(7.75)
		expect(estimate.pricedCount).toBe(2)
		expect(estimate.itemCount).toBe(3)
		expect(estimate.priceByItemId.get('a')).toBe(3.5)
		expect(estimate.priceByItemId.has('b')).toBe(false)
	})

	it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY, null])('treats %s as no data', value => {
		const estimate = buildSessionPriceEstimate([item('a', 'milk')], [base('milk', value as number | null)])

		expect(estimate.pricedCount).toBe(0)
		expect(estimate.total).toBe(0)
	})

	it('covers an item added during the trip when its normalized name matches', () => {
		const estimate = buildSessionPriceEstimate([item('a', 'milk'), item('new', 'milk')], [base('milk', 3)])

		expect(estimate.pricedCount).toBe(2)
		expect(estimate.total).toBe(6)
	})

	it('leaves items with an unknown or missing normalized name unpriced', () => {
		const estimate = buildSessionPriceEstimate([item('a', null), item('b', 'caviar')], [base('milk', 3), base(null, 9)])

		expect(estimate.pricedCount).toBe(0)
		expect(estimate.itemCount).toBe(2)
	})

	it('does not multiply by quantity: only ids and names are read', () => {
		const estimate = buildSessionPriceEstimate([{ id: 'a', normalized_name: 'milk', quantity: 5 } as never], [base('milk', 3)])

		expect(estimate.total).toBe(3)
	})
})
