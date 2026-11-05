import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/commons', async importOriginal => ({
	...await importOriginal<typeof import('@/components/commons')>(),
	SheetDialog: ({ children, testId }: { children: React.ReactNode; testId: string }) => createElement('div', { 'data-testid': testId }, children),
}))

import { ItemStorePricesSheet } from '../items/item-store-prices-sheet'

const prices = [
	{ store: { id: 'bulk', name: 'A very long grocery store name that must remain available to assistive technology' }, last_price: 8, last_quantity: 2, last_unit: 'each', last_price_at: '2026-03-04T00:00:00Z' },
	{ store: { id: 'metro', name: 'Metro' }, last_price: 4.49, last_quantity: 1, last_unit: null, last_price_at: '2026-03-03T00:00:00Z' },
]

describe('ItemStorePricesSheet', () => {
	it('shows receipt prices, quantity context, and the cheapest comparable store', () => {
		const html = renderToStaticMarkup(createElement(ItemStorePricesSheet, {
			open: true, onOpenChange: vi.fn(), itemName: 'Yogurt', prices, testId: 'prices-sheet-yogurt',
		}))

		expect(html).toContain('2 each')
		expect(html).toContain('$4.00 / each')
		expect(html).toContain('$4.49')
		expect(html).toContain('Cheapest')
		expect(html).toContain('A very long grocery store name that must remain available to assistive technology')
	})

	it('explains incomparable units without highlighting a price', () => {
		const html = renderToStaticMarkup(createElement(ItemStorePricesSheet, {
			open: true,
			onOpenChange: vi.fn(),
			itemName: 'Apples',
			prices: [
				{ ...prices[0], last_unit: 'kg' },
				{ ...prices[1], last_unit: 'each' },
			],
			testId: 'prices-sheet-apples',
		}))

		expect(html).toContain('Some prices use different units and can’t be compared.')
		expect(html).not.toContain('Cheapest')
	})
})
