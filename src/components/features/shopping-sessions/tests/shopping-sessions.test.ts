import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { SessionProgressCard, ShoppingSessionActions, ShoppingSessionItems } from '@/components/features/shopping-sessions'
import type { ShoppingSessionItem } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const item = (overrides: Partial<ShoppingSessionItem>) =>
	({ id: 'i1', shopping_session_id: 's1', name: 'Milk', quantity: 1, unit: 'unit', category: 'Dairy', notes: null, checked: false, sort_order: 0, ...overrides }) as ShoppingSessionItem

describe('SessionProgressCard', () => {
	const render = (checked: number, total: number, isCompleted = false) =>
		renderToStaticMarkup(createElement(SessionProgressCard, { checked, total, isCompleted }))

	it('says how many items are collected out of all, with the percentage in mono', () => {
		const html = render(1, 4)

		expect(html).toContain('data-testid="session-progress-card"')
		expect(html).toContain('Collected')
		expect(html).toMatch(/<b[^>]*>1<\/b> of <b[^>]*>4<\/b> items/)
		expect(html).toContain('25%')
		expect(html).toContain('text-blue-700')
	})

	it('turns green at 100% and reads "Purchased" once the trip is over', () => {
		const html = render(4, 4, true)

		expect(html).toContain('100%')
		expect(html).toContain('text-green-700')
		expect(html).toContain('bg-green-500')
		expect(html).toContain('Purchased')
	})

	it('does not divide by zero for a session without items', () => {
		expect(render(0, 0)).toContain('0%')
	})
})

describe('ShoppingSessionItems', () => {
	it('puts the items in one card with a section per category and "done/total" for each', () => {
		const html = renderToStaticMarkup(
			createElement(ShoppingSessionItems, {
				items: [item({ id: 'a', category: 'Bakery', checked: true, name: 'ahora si?' }), item({ id: 'b' }), item({ id: 'c', name: 'NEILSON 2% MILK', checked: true })],
			}),
		)

		expect(html).toContain('data-testid="session-items-card"')
		expect(html).toContain('data-testid="session-category-Bakery"')
		expect(html).toContain('1/1')
		expect(html).toContain('1/2')
		expect(html).toContain('Neilson 2% Milk')
	})

	it('strikes through what is in the cart and keeps what is left at the top of its category', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item({ id: 'done', name: 'Done', checked: true }), item({ id: 'todo', name: 'Todo', sort_order: 5 })] }))

		expect(html).toContain('line-through')
		expect(html.indexOf('Todo')).toBeLessThan(html.indexOf('Done'))
		expect(html).toContain('aria-label="Done, collected"')
		expect(html).toContain('aria-label="Mark Todo as collected"')
	})

	it('keeps long product names and notes available to read without truncating the row', () => {
		const name = 'Extra-long product name with a flavor and package size that needs several lines to read completely'
		const notes = 'Look for the unsweetened version in the back aisle, and check the larger package size before choosing.'
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item({ name, notes })] }))

		expect(html).toContain(name)
		expect(html).toContain(notes)
		expect(html).not.toContain('line-clamp-2')
		expect(html).toContain('data-testid="session-item-i1"')
	})

	it('is read-only for a finished session: no checkbox and no menu', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [item({ checked: true })], isCompleted: true }))

		expect(html).not.toContain('role="checkbox"')
		expect(html).not.toContain('More options')
	})

	it('has its own message when there is nothing to show', () => {
		expect(renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [] }))).toContain('Add items to continue this shopping session.')
		expect(renderToStaticMarkup(createElement(ShoppingSessionItems, { items: [], isCompleted: true }))).toContain('No purchased items')
	})
})

describe('ShoppingSessionActions', () => {
	const render = (isOwner: boolean) => renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 's1', checked: 1, total: 4, isOwner }))

	it('gives phones one small floating Actions button above the tab bar and desktop two buttons', () => {
		const html = render(true)

		expect(html).toContain('data-testid="session-actions-floating"')
		expect(html).toContain('fixed right-4')
		expect(html).toContain('lg:hidden')
		expect(html).toContain('data-testid="session-actions-button"')
		const actionsButton = html.match(/<button(?=[^>]*data-testid="session-actions-button")[^>]*>/)?.[0] ?? ''
		expect(actionsButton).toContain('h-11')
		expect(html).toContain('Actions')
		expect(html).toContain('data-testid="session-actions-inline"')
		expect(html).toContain('Cancel Shopping')
		expect(html).toContain('Complete Shopping')
	})

	it('is only for the owner of the list', () => {
		expect(render(false)).toBe('')
	})
})
