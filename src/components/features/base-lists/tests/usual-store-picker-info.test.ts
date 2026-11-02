import { describe, expect, it } from 'vitest'

import { buildUsualStorePickerInfo } from '../items/helpers/usual-store-picker-info'

const store = (id: string, name: string) => ({ id, name })

describe('buildUsualStorePickerInfo', () => {
	it('says how many of the purchases happened at an automatic usual store and what each store last charged', () => {
		const info = buildUsualStorePickerInfo({
			usual_store: { ...store('nf', 'No Frills'), source: 'auto', purchase_count: 5 },
			purchase_total: 7,
			other_stores: [{ ...store('co', 'Costco'), purchase_count: 2 }],
			store_prices: [{ store: store('nf', 'No Frills'), last_price: 6.29, last_quantity: null, last_unit: null, last_price_at: '2026-02-19T18:40:00.000Z' }],
		})

		expect(info.headline).toBe('Automatic · No Frills')
		expect(info.body).toBe('Bought there 5 of 7 times. Follows your receipts.')
		expect(info.details.nf.startsWith('Last $6.29 · ')).toBe(true)
		expect(info.details.co).toBe('2 purchases')
	})

	it('says a manual store stays until it is changed, and never claims the receipts decided it', () => {
		const info = buildUsualStorePickerInfo({
			usual_store: { ...store('co', 'Costco'), source: 'manual', purchase_count: 0 },
			purchase_total: 3,
			other_stores: [],
			store_prices: [],
		})

		expect(info.headline).toBe('Set by you · Costco')
		expect(info.body).toBe('It stays there until you change it.')
	})

	it('explains how a store is learned when the item has none yet', () => {
		const info = buildUsualStorePickerInfo({ usual_store: null, purchase_total: 1, other_stores: [], store_prices: [] })

		expect(info.headline).toBe('No usual store yet')
		expect(info.body).toContain('Bought 1 time with a receipt')
		expect(buildUsualStorePickerInfo({ usual_store: null }).body).toContain('3 purchases')
	})
})
