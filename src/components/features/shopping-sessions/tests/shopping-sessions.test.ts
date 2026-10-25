import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { ShoppingSessionActions, ShoppingSessionItems } from '@/components/features/shopping-sessions'
import type { ShoppingSessionItem } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const item = (overrides: Partial<ShoppingSessionItem>) =>
	({ id: 'i1', shopping_session_id: 's1', name: 'Milk', quantity: 1, unit: 'unit', category: 'Dairy', notes: null, checked: false, sort_order: 0, ...overrides }) as ShoppingSessionItem

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
})

describe('ShoppingSessionActions', () => {
	it('is only for the owner of the list', () => {
		const render = (isOwner: boolean) => renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 's1', checked: 1, total: 4, isOwner }))

		expect(render(true)).toContain('Complete Shopping')
		expect(render(false)).toBe('')
	})
})
