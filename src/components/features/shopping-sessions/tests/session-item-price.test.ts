import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { ShoppingSessionItem } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/lib/api/endpoints', () => ({
	deleteShoppingSessionItem: vi.fn(),
	toggleShoppingSessionItem: vi.fn(),
	updateShoppingSessionItem: vi.fn(),
}))

import { ShoppingSessionItemRow } from '../shopping-session-item-row'
import { ShoppingSessionItems } from '../shopping-session-items'

const item = (id: string, name: string, extra: Partial<ShoppingSessionItem> = {}) =>
	({
		id,
		shopping_session_id: 'synthetic-session',
		name,
		quantity: 1,
		unit: 'unit',
		category: 'Grocery',
		notes: null,
		checked: false,
		sort_order: 0,
		...extra,
	}) as ShoppingSessionItem

describe('ShoppingSessionItemRow average price', () => {
	it('shows the list’s average price on the row when it has one', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItemRow, { item: item('i1', 'Milk'), averagePrice: 3.49 }))

		expect(html).toContain('data-testid="session-item-i1-average-price"')
		expect(html).toContain('$3.49')
	})

	it('draws no price, and no $0, for an item without price data', () => {
		for (const averagePrice of [undefined, null, 0]) {
			const html = renderToStaticMarkup(createElement(ShoppingSessionItemRow, { item: item('i1', 'Milk'), averagePrice }))

			expect(html).not.toContain('average-price')
			expect(html).not.toContain('$0')
		}
	})
})

describe('ShoppingSessionItems prices', () => {
	it('hands each row the price of its own item only', () => {
		const items = [item('i1', 'Milk'), item('i2', 'Bread', { sort_order: 1 })]

		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items, priceByItemId: { i1: 3.49 } }))

		expect(html).toContain('data-testid="session-item-i1-average-price"')
		expect(html).not.toContain('data-testid="session-item-i2-average-price"')
	})

	it('shows no prices when none are passed, as on a finished session', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item('i1', 'Milk', { checked: true })], isCompleted: true }))

		expect(html).not.toContain('average-price')
	})
})
