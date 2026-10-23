import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { ShoppingSessionItem } from '@/types'

const mocks = vi.hoisted(() => ({
	deleteShoppingSessionItem: vi.fn(),
	confirm: null as null | (() => Promise<void>),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/lib/api/endpoints', () => ({
	deleteShoppingSessionItem: mocks.deleteShoppingSessionItem,
	toggleShoppingSessionItem: vi.fn(),
	updateShoppingSessionItem: vi.fn(),
}))
vi.mock('@/components/features/list-items', async () => {
	const React = await import('react')
	return {
		AveragePrice: () => null,
		ItemEditForm: () => null,
		ItemQuantityChip: () => React.createElement('span'),
	}
})
vi.mock('@/components/commons', async () => {
	const React = await import('react')
	return {
		ConfirmSheet: (props: { testId: string; onConfirm: () => Promise<void> }) => {
			mocks.confirm = props.onConfirm
			return React.createElement('div', { 'data-testid': props.testId })
		},
		RowMenu: () => null,
	}
})

import { ShoppingSessionItemRow } from '../shopping-session-item-row'

const item = {
	id: 'synthetic-item',
	shopping_session_id: 'synthetic-session',
	name: 'Sample product',
	quantity: 1,
	unit: 'unit',
	category: 'Grocery',
	notes: null,
	checked: false,
	sort_order: 0,
} as ShoppingSessionItem

describe('ShoppingSessionItemRow deletion', () => {
	it('does not request deletion until the confirmation handler runs, then calls it once', async () => {
		mocks.deleteShoppingSessionItem.mockResolvedValue({ error: 'Synthetic failure' })
		mocks.confirm = null
		const html = renderToStaticMarkup(createElement(ShoppingSessionItemRow, { item }))

		expect(html).toContain('data-testid="session-item-synthetic-item"')
		expect(html).toContain('data-testid="delete-session-item-synthetic-item-sheet"')
		expect(mocks.deleteShoppingSessionItem).not.toHaveBeenCalled()
		expect(mocks.confirm).toBeTypeOf('function')

		await (mocks.confirm as (() => Promise<void>) | null)?.()

		expect(mocks.deleteShoppingSessionItem).toHaveBeenCalledTimes(1)
		expect(mocks.deleteShoppingSessionItem).toHaveBeenCalledWith('synthetic-item')
	})
})
