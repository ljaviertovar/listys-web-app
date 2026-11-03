import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { HistorySessionCard, ShoppingSessionActions, ShoppingSessionItems } from '@/components/features/shopping-sessions'
import type { ShoppingSessionItem } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const item = (overrides: Partial<ShoppingSessionItem>) =>
	({ id: 'i1', shopping_session_id: 's1', name: 'Milk', quantity: 1, unit: 'unit', category: 'Dairy', notes: null, checked: false, sort_order: 0, is_other_store: false, ...overrides }) as ShoppingSessionItem

describe('ShoppingSessionItems', () => {
	it('opens its categories by default and folds them only on the visit that follows starting the session', () => {
		const items = [item({ id: 'a', name: 'Apples', category: 'Produce' }), item({ id: 'b', name: 'Yogurt', category: 'Dairy' })]

		const open = renderToStaticMarkup(createElement(ShoppingSessionItems, { items }))
		const folded = renderToStaticMarkup(createElement(ShoppingSessionItems, { items, startCollapsed: true }))

		expect(open).toContain('Apples')
		expect(open).toContain('Yogurt')
		expect(folded).toContain('data-testid="session-category-Produce"')
		expect(folded).not.toContain('Apples')
		expect(folded).not.toContain('Yogurt')
	})

	it('keeps what is left at the top of its category', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item({ id: 'done', name: 'Done', checked: true }), item({ id: 'todo', name: 'Todo', sort_order: 5 })] }))

		expect(html.indexOf('Todo')).toBeLessThan(html.indexOf('Done'))
	})

	it('is read-only for a finished session: no checkbox and no menu', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item({ checked: true })], isCompleted: true }))

		expect(html).not.toContain('role="checkbox"')
		expect(html).not.toContain('More options')
	})

	it('shows a receipt line price on completed items, never an average price', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, {
			items: [item({ checked: true, price: 7.25 })],
			isCompleted: true,
			priceByItemId: { i1: 3.5 },
		}))

		expect(html).toContain('data-testid="session-item-i1-receipt-price"')
		expect(html).toContain('$7.25')
		expect(html).not.toContain('Average price')
		expect(html).not.toContain('$3.50')
	})

	it('separates items for the selected store from other stores and untagged items', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, {
			items: [item({ id: 'here', name: 'Milk' }), item({ id: 'other', name: 'Bread', is_other_store: true })],
			storeId: 'store-1',
			storeName: 'Market',
		}))

		expect(html).toContain('At Market')
		expect(html).toContain('data-testid="session-other-stores-section"')
		expect(html).toContain('Other Stores and Untagged')
		expect(html.indexOf('Milk')).toBeLessThan(html.indexOf('Other Stores and Untagged'))
	})

	it('labels an unreadable store and opens the other-items section when none are tagged for it', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, {
			items: [item({ is_other_store: true })],
			storeId: 'store-1',
			storeName: null,
		}))

		expect(html).toContain('At this store')
		expect(html).toContain('data-state="open"')
	})
})

describe('ShoppingSessionActions', () => {
	it('is only for the owner of the list', () => {
		const render = (isOwner: boolean) => renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 's1', checked: 1, total: 4, isOwner }))

		expect(render(true)).toContain('Complete Shopping')
		expect(render(false)).toBe('')
	})
})

describe('HistorySessionCard receipt status', () => {
	const session = { id: 's1', name: 'Weekly shop', status: 'completed', started_at: null, completed_at: null, total_amount: 20, base_list: { name: 'Groceries' } }
	const render = (receipt: { id: string } | null | undefined, href?: string) =>
		renderToStaticMarkup(createElement(HistorySessionCard, { session: { ...session, receipt }, href }))

	it('shows the trip as completed and its receipt as attached, with no action to add one', () => {
		const html = render({ id: 'ticket-1' })
		expect(html).toContain('Completed')
		expect(html).toContain('data-testid="history-receipt-marker-s1"')
		expect(html).toContain('Receipt attached')
		expect(html).not.toContain('history-add-receipt-s1')
	})

	it('shows a trip without a receipt as completed, marks the missing receipt and offers Add Receipt', () => {
		const html = render(null)
		expect(html).toContain('Completed')
		expect(html).toContain('data-testid="history-no-receipt-s1"')
		expect(html).toContain('href="/shopping/s1?receipt=add"')
		expect(html).toContain('Add Receipt')
	})

	it('opens the trip it came from with the receipt choice, keeping the list filter', () => {
		expect(render(null, '/shopping/s1?from=trips&list=l1')).toContain('href="/shopping/s1?from=trips&amp;list=l1&amp;receipt=add"')
	})

	it('shows neither receipt state when it is not known', () => {
		const html = render(undefined)
		expect(html).not.toContain('history-receipt-marker')
		expect(html).not.toContain('history-no-receipt')
		expect(html).not.toContain('history-add-receipt')
	})
})
