import { describe, expect, it } from 'vitest'

import { compareStorePrices } from '../items/helpers/compare-store-prices'
import type { StorePriceEntry } from '../items/helpers/item-store-summary'

const price = (id: string, amount: number, quantity: number | null = 1, unit: string | null = null, date: string | null = '2026-03-01') => ({
	store: { id, name: id }, last_price: amount, last_quantity: quantity, last_unit: unit, last_price_at: date,
}) satisfies StorePriceEntry

describe('compareStorePrices', () => {
	it('compares per-unit cost for normalized matching units and picks the latest on a tie', () => {
		expect(compareStorePrices([price('bulk', 8, 2, 'UNIT'), price('metro', 4.49, 1, 'each')])).toEqual({
			cheapestStoreId: 'bulk', comparableCount: 2, notComparable: false,
		})
		expect(compareStorePrices([price('older', 4, 1, null, '2026-02-01'), price('newer', 4, 1, 'unit', '2026-03-01')]).cheapestStoreId).toBe('newer')
	})

	it('does not compare different units or non-positive quantities', () => {
		expect(compareStorePrices([price('kg', 3.2, 1, 'kg'), price('each', 2.99)] )).toEqual({
			cheapestStoreId: null, comparableCount: 0, notComparable: true,
		})
		expect(compareStorePrices([price('one', 3, 0), price('two', 4, -1)])).toEqual({
			cheapestStoreId: null, comparableCount: 0, notComparable: true,
		})
	})

	it('returns no highlight with only one comparable store', () => {
		expect(compareStorePrices([price('one', 3)])).toEqual({
			cheapestStoreId: null, comparableCount: 0, notComparable: false,
		})
	})
})
