import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { BaseListItems, BaseListsList, StartShoppingDialog } from '@/components/features/base-lists'
import type { BaseListItem, BaseListWithCount } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const list = (overrides: Partial<BaseListWithCount>) => ({ id: 'l1', name: 'Items for Dinner', notes: null, items_count: 4, ...overrides }) as BaseListWithCount
const item = (overrides: Partial<BaseListItem>) =>
	({ id: 'i1', base_list_id: 'l1', name: 'Milk', quantity: 1, unit: 'pcs', category: 'Dairy', notes: null, sort_order: 0, ...overrides }) as BaseListItem

describe('BaseListsList', () => {
	it('leaves out the list that is being shopped', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, { baseLists: [list({}), list({ id: 'l2', name: 'Weekly Groceries' })], activeBaseListId: 'l1' }),
		)

		expect(html).not.toContain('data-testid="list-card-l1"')
		expect(html).toContain('data-testid="list-card-l2"')
		expect(html).toMatch(/>1<\/b> list</)
	})
})

describe('BaseListItems', () => {
	it('disables the row menus while the list is being shopped', () => {
		const html = renderToStaticMarkup(createElement(BaseListItems, { baseListId: 'l1', items: [item({})], isLocked: true }))

		expect(html).toContain('data-testid="base-list-locked-notice"')
		expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="base-list-item-i1-menu"/)
	})
})

describe('StartShoppingDialog', () => {
	const render = (props: Partial<Parameters<typeof StartShoppingDialog>[0]> = {}) =>
		renderToStaticMarkup(createElement(StartShoppingDialog, { baseListId: 'l1', baseListName: 'Items for Dinner', itemsCount: 4, ...props }))

	it('is disabled when the list has no items', () => {
		expect(render({ itemsCount: 0 })).toMatch(/<button[^>]*disabled=""/)
	})

	it('disappears while a shopping session is active: only one can run at a time', () => {
		// The page knows it from the server; the client store covers the rest, but it is not readable in a server render.
		expect(render({ sessionActive: true })).toBe('')
	})
})
