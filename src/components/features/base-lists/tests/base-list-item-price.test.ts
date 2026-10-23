import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { BaseListItem } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/lib/api/endpoints', () => ({
	createBaseListItem: vi.fn(),
	deleteBaseListItem: vi.fn(),
	updateBaseListItem: vi.fn(),
}))

import { BaseListItemRow } from '../items/base-list-item-row'

const item = (extra: Partial<BaseListItem> = {}) =>
	({
		id: 'i1',
		base_list_id: 'list-1',
		name: 'Milk',
		quantity: 1,
		unit: 'L',
		notes: null,
		category: 'Dairy',
		sort_order: 0,
		average_price: null,
		...extra,
	}) as BaseListItem

describe('BaseListItemRow average price', () => {
	it('shows the average price with the note on the same line', () => {
		const html = renderToStaticMarkup(createElement(BaseListItemRow, { item: item({ average_price: 3.49, notes: 'Lactose free' }) }))

		expect(html).toContain('data-testid="base-list-item-i1-average-price"')
		expect(html).toContain('$3.49')
		expect(html).toContain('Lactose free')
	})

	it('shows the price alone when there is no note', () => {
		const html = renderToStaticMarkup(createElement(BaseListItemRow, { item: item({ average_price: 12 }) }))

		expect(html).toContain('$12.00')
	})

	it.each([null, 0])('shows no price line for an average of %s', average => {
		const html = renderToStaticMarkup(createElement(BaseListItemRow, { item: item({ average_price: average }) }))

		expect(html).not.toContain('average-price')
		expect(html).not.toContain('$0')
	})
})
