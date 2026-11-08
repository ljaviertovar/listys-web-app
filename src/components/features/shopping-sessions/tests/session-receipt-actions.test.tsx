import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ShoppingSessionActions } from '../shopping-session-actions'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/components/ui/dropdown-menu', async importOriginal => ({
	...await importOriginal<typeof import('@/components/ui/dropdown-menu')>(),
	DropdownMenuContent: ({ children }: { children: ReactNode }) => createElement('div', { 'data-testid': 'actions-menu-content' }, children),
	DropdownMenuItem: ({ children }: { children: ReactNode }) => createElement('div', {}, children),
	DropdownMenuSeparator: () => null,
}))

describe('trip owner receipt action', () => {
	it('keeps receipt upload out of the owner menu', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 'trip', checked: 1, total: 3, baseListId: 'list', listName: 'Pantry', isOwner: true }))
		const menu = html.slice(html.indexOf('actions-menu-content'))
		expect(menu).not.toContain('Upload Receipt')
		expect(menu.indexOf('Complete Shopping')).toBeLessThan(menu.indexOf('Cancel Shopping'))
	})
	it('keeps Add Item available to a viewer who does not own the list', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 'trip', checked: 1, total: 3, listName: 'Pantry', isOwner: false }))
		expect(html).toContain('Add Item')
		expect(html).not.toContain('Complete Shopping')
	})
})
