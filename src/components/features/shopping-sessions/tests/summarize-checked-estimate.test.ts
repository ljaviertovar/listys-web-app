import { describe, expect, it } from 'vitest'
import { summarizeCheckedEstimate } from '../helpers/summarize-checked-estimate'
import { buildSessionPriceEstimate } from '../helpers/build-session-price-estimate'

describe('checked trip estimate', () => {
	it('keeps the full list estimate independent from trip check state', () => {
		const baseItems = [{ id: 'milk', normalized_name: 'milk', average_price: 3.5 }, { id: 'eggs', normalized_name: 'eggs', average_price: 4.25 }]
		const tripItems = baseItems.map(item => ({ ...item, checked: false }))
		const fullEstimate = () => buildSessionPriceEstimate(baseItems, baseItems)
		const checkedEstimate = () => summarizeCheckedEstimate(tripItems, fullEstimate().priceByItemId)
		expect(checkedEstimate().total).toBe(0)
		tripItems[0].checked = true
		expect(checkedEstimate().total).toBe(3.5)
		expect(fullEstimate().total).toBe(7.75)
		tripItems[0].checked = false
		expect(checkedEstimate().total).toBe(0)
		expect(fullEstimate().total).toBe(7.75)
	})
	it('adds and removes checked contributions without changing row prices', () => {
		const prices = new Map([['milk', 3.5], ['eggs', 4.25]])
		const items = [{ id: 'milk', checked: true, quantity: 5 }, { id: 'eggs', checked: false }, { id: 'unknown', checked: true }]
		expect(summarizeCheckedEstimate(items, prices)).toEqual({ total: 3.5, pricedCount: 1, itemCount: 2 })
		items[1].checked = true
		expect(summarizeCheckedEstimate(items, prices).total).toBe(7.75)
		items[1].checked = false
		expect(summarizeCheckedEstimate(items, prices).total).toBe(3.5)
		expect([...prices.values()]).toEqual([3.5, 4.25])
	})
	it('distinguishes an empty basket from unpriced collected items', () => {
		expect(summarizeCheckedEstimate([{ id: 'a', checked: false }], new Map())).toEqual({ total: 0, pricedCount: 0, itemCount: 0 })
		expect(summarizeCheckedEstimate([{ id: 'a', checked: true }], new Map())).toEqual({ total: 0, pricedCount: 0, itemCount: 1 })
	})
})
