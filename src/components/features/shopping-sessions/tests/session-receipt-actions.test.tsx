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
	it('places upload before completion and cancellation in the owner menu', () => {
		const html = renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 'trip', checked: 1, total: 3, isOwner: true, canUploadReceipt: true }))
		const menu = html.slice(html.indexOf('actions-menu-content'))
		expect(menu.indexOf('Upload Receipt')).toBeGreaterThan(0)
		expect(menu.indexOf('Upload Receipt')).toBeLessThan(menu.indexOf('Complete Shopping'))
		expect(menu.indexOf('Complete Shopping')).toBeLessThan(menu.indexOf('Cancel Shopping'))
	})
	it('does not offer an upload to a viewer who did not run the trip', () => {
		expect(renderToStaticMarkup(createElement(ShoppingSessionActions, { sessionId: 'trip', checked: 1, total: 3, isOwner: false, canUploadReceipt: false }))).toBe('')
	})
})
