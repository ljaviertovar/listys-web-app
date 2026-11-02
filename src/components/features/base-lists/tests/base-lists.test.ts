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
	it('keeps every list visible and offers resume for each active list', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, {
				baseLists: [list({}), list({ id: 'l2', name: 'Weekly Groceries' })],
				activeSessionIds: { l1: 'session-1', l2: 'session-2' },
			}),
		)

		expect(html).toContain('data-testid="list-card-l1"')
		expect(html).toContain('data-testid="list-card-l2"')
		expect(html.match(/Resume Shopping/g)).toHaveLength(2)
		expect(html).toMatch(/>2<\/b> lists/)
	})
})

describe('BaseListsList cards', () => {
	const render = (props: Partial<Parameters<typeof BaseListsList>[0]> = {}) =>
		renderToStaticMarkup(createElement(BaseListsList, { baseLists: [list({}), list({ id: 'l2', name: 'Weekly Groceries' })], ...props }))

	it('marks the default list, says when each list was last shopped and opens the list from the card', () => {
		const html = render({ defaultListId: 'l2', lastTripByList: { l1: '2026-10-28T22:07:00.000Z' }, sharedCountByList: { l1: 2 } })

		expect(html).toContain('data-testid="list-card-l2-default"')
		expect(html).not.toContain('data-testid="list-card-l1-default"')
		expect(html).toContain('No trips yet')
		expect(html).toContain('Shared with 2 people')
		expect(html.match(/>View Items</g)).toHaveLength(2)
		expect(html).not.toContain('Start Shopping')
	})

	it('keeps the way back into a trip on the card of a list that is being shopped', () => {
		const html = render({ activeSessionIds: { l1: 'session-1' } })

		expect(html.match(/Resume Shopping/g)).toHaveLength(1)
		expect(html.match(/>View Items</g)).toHaveLength(1)
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

	it('keeps the trigger enabled on an empty list so the sheet can say why it cannot start', () => {
		expect(render({ itemsCount: 0 })).not.toMatch(/<button[^>]*disabled=""/)
	})

	it('offers to resume when this list already has an active session', () => {
		expect(render({ sessionActive: true, activeSessionId: 'session-1' })).toContain('Resume Shopping')
	})
})
