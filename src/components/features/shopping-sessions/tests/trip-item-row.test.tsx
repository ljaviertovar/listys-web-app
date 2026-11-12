import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { ShoppingSessionItem } from '@/types'
import { ShoppingSessionItemRow } from '../shopping-session-item-row'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const item = { id: 'eggs', name: 'Large Eggs 12', quantity: 1, unit: 'unit', notes: 'Free range', checked: true, price: 4.49 } as ShoppingSessionItem
const render = (completed: boolean, withData = true) => renderToStaticMarkup(createElement(ShoppingSessionItemRow, {
	item: withData ? item : { ...item, notes: null, price: null }, isCompleted: completed, averagePrice: withData ? 6.29 : null,
	storeInfo: { usual_store: { id: 'a', name: 'No Frills', source: 'auto', purchase_count: 3 }, other_stores: withData ? [{ id: 'b', name: 'Costco', purchase_count: 1 }] : [] },
}))

describe('trip item display rules', () => {
	it('uses receipt price and omits interactive ticking and average data on completed trips', () => {
		const html = render(true)
		expect(html).toContain('$4.49')
		expect(html).not.toContain('$6.29')
		expect(html).not.toContain('role="checkbox"')
		expect(html).not.toContain('eggs-average-price')
	})
	it('shows the average price and permits ticking while shopping', () => {
		const html = render(false)
		expect(html).toContain('$6.29')
		expect(html).toContain('avg')
		expect(html).not.toContain('$4.49')
		expect(html).toContain('role="checkbox"')
	})
	it('only shows a note and other stores when supplied, and leaves a missing price explicit', () => {
		expect(render(false)).toContain('session-item-eggs-note')
		expect(render(false)).toContain('session-item-eggs-other-stores')
		expect(render(false, false)).not.toContain('session-item-eggs-note')
		expect(render(false, false)).not.toContain('session-item-eggs-other-stores')
		expect(render(true, false)).toContain('No price yet')
	})
})
