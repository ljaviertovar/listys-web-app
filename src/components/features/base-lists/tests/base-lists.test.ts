import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { BaseListItems, BaseListsList, BaseListsSkeleton, StartShoppingDialog } from '@/components/features/base-lists'
import type { BaseListItem, BaseListWithCount } from '@/types'

import { toRestorePayload } from '../items/helpers/restore-item'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const list = (overrides: Partial<BaseListWithCount>) => ({ id: 'l1', name: 'Items for Dinner', notes: null, items_count: 4, ...overrides }) as BaseListWithCount
const item = (overrides: Partial<BaseListItem>) =>
	({ id: 'i1', base_list_id: 'l1', name: 'Milk', quantity: 1, unit: 'pcs', category: 'Dairy', notes: null, sort_order: 0, ...overrides }) as BaseListItem

describe('BaseListsList', () => {
	it('counts the lists, offers New Base List and links each card to its items', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, { baseLists: [list({}), list({ id: 'l2', name: 'Weekly Groceries', items_count: 12 })] }),
		)

		expect(html).toContain('data-testid="base-lists-toolbar"')
		expect(html).toMatch(/>2<\/b> lists</)
		expect(html).toContain('data-testid="create-base-list-button"')
		expect(html).toContain('href="/base-lists/l1/edit"')
		expect(html).toContain('View Items')
		expect(html).toContain('aria-label="View Items in Items for Dinner"')
	})

	it('shows every list in one grid, with no group wording', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, {
				baseLists: [list({ group_id: 'g1' }), list({ id: 'l2', name: 'Costco', group_id: 'g2' }), list({ id: 'l3', name: 'Pantry', group_id: 'g3' })],
			}),
		)

		expect(html).toContain('data-testid="base-lists-grid"')
		expect(html.match(/data-testid="list-card-l\d"/g)).toHaveLength(3)
		expect(html).not.toMatch(/group/i)
	})

	it('tells apart lists that share a name without touching the stored name', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, {
				baseLists: [
					list({ id: 'old', name: 'Weekly', created_at: '2026-01-01T00:00:00Z' }),
					list({ id: 'new', name: 'Weekly', created_at: '2026-02-01T00:00:00Z' }),
				],
			}),
		)

		expect(html).toContain('Weekly (2)')
		expect(html).toContain('aria-label="View Items in Weekly (2)"')
		expect(html).toContain('aria-label="More options for Weekly (2)"')
		expect(html).toContain('aria-label="View Items in Weekly"')
	})

	it('keeps long list titles and notes available in the card', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, {
				baseLists: [list({ name: 'Supplies for the whole family on the road', notes: 'Food, first aid, and practical supplies for our long weekend trip.' })],
			}),
		)

		expect(html).toContain('Supplies for the whole family on the road')
		expect(html).toContain('Food, first aid, and practical supplies for our long weekend trip.')
		expect(html).not.toContain('truncate')
	})

	it('leaves out the list that is being shopped', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListsList, { baseLists: [list({}), list({ id: 'l2', name: 'Weekly Groceries' })], activeBaseListId: 'l1' }),
		)

		expect(html).not.toContain('data-testid="list-card-l1"')
		expect(html).toContain('data-testid="list-card-l2"')
		expect(html).toMatch(/>1<\/b> list</)
	})

	it('invites the first list with a card of its own and no toolbar', () => {
		const html = renderToStaticMarkup(createElement(BaseListsList, { baseLists: [] }))

		expect(html).toContain('data-testid="base-lists-empty-state"')
		expect(html).toContain('No lists yet')
		expect(html).toContain('data-testid="create-base-list-button"')
		expect(html).not.toContain('base-lists-toolbar')
		expect(html).not.toMatch(/group/i)
	})
})

describe('BaseListsSkeleton', () => {
	it('draws the toolbar and three card shapes', () => {
		const html = renderToStaticMarkup(createElement(BaseListsSkeleton))

		expect(html).toContain('data-testid="base-lists-skeleton"')
		expect(html.match(/data-testid="base-list-card-skeleton-/g)).toHaveLength(3)
	})
})

describe('BaseListItems', () => {
	it('puts the items in one card, a section per category, with Title Case names and the count of each', () => {
		const html = renderToStaticMarkup(
			createElement(BaseListItems, {
				baseListId: 'l1',
				items: [item({}), item({ id: 'i2', name: 'NEILSON 2% MILK' }), item({ id: 'i3', name: 'soap', category: 'Home', unit: 'l' })],
			}),
		)

		expect(html).toContain('data-testid="base-list-items-card"')
		expect(html).toContain('data-testid="base-list-category-Dairy"')
		expect(html).toContain('data-testid="base-list-category-Home"')
		expect(html).toContain('2 items')
		expect(html).toContain('1 item')
		expect(html).toContain('Neilson 2% Milk')
		expect(html).toContain('aria-label="More options for Milk"')
	})

	it('disables the row menus while the list is being shopped', () => {
		const html = renderToStaticMarkup(createElement(BaseListItems, { baseListId: 'l1', items: [item({})], isLocked: true }))

		expect(html).toContain('data-testid="base-list-locked-notice"')
		expect(html).toContain('Make changes in that session, or finish it to edit this base list.')
		expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="base-list-item-i1-menu"/)
	})

	it('opens every category, however long the list is', () => {
		const many = Array.from({ length: 13 }, (_, index) => item({ id: `i${index}`, name: `Item ${index}`, category: `Category ${String.fromCharCode(65 + index)}` }))
		const html = renderToStaticMarkup(createElement(BaseListItems, { baseListId: 'l1', items: many }))

		expect(html).toContain('Item 0')
		expect(html).toContain('Item 2<')
		expect(html).toContain('Item 12<')
	})

	it('invites the first item when the list is empty', () => {
		const html = renderToStaticMarkup(createElement(BaseListItems, { baseListId: 'l1', items: [] }))

		expect(html).toContain('data-testid="base-list-empty-state"')
		expect(html).toContain('No items yet')
		expect(html).toContain('data-testid="add-item-button-base-list"')
	})

	it('explains why an empty list cannot be edited during a shopping session', () => {
		const html = renderToStaticMarkup(createElement(BaseListItems, { baseListId: 'l1', items: [], isLocked: true }))

		expect(html).toContain('data-testid="base-list-locked-notice"')
		expect(html).toContain('A shopping session is using this list.')
		expect(html).toContain('disabled=""')
	})
})

describe('toRestorePayload', () => {
	it('brings an item back as it was, without the fields it did not have', () => {
		expect(toRestorePayload(item({ notes: 'oat', category: 'Dairy' }))).toEqual({
			base_list_id: 'l1',
			name: 'Milk',
			quantity: 1,
			sort_order: 0,
			unit: 'pcs',
			notes: 'oat',
			category: 'Dairy',
		})
		expect(toRestorePayload(item({ unit: null, notes: null, category: null, quantity: null, sort_order: null }))).toEqual({
			base_list_id: 'l1',
			name: 'Milk',
			quantity: 1,
			sort_order: 0,
		})
	})
})

describe('StartShoppingDialog', () => {
	const render = (props: Partial<Parameters<typeof StartShoppingDialog>[0]> = {}) =>
		renderToStaticMarkup(createElement(StartShoppingDialog, { baseListId: 'l1', baseListName: 'Items for Dinner', itemsCount: 4, ...props }))

	it('is a Start Shopping button named after its list', () => {
		const html = render()

		expect(html).toContain('data-testid="start-shopping-button"')
		expect(html).toContain('aria-label="Start shopping Items for Dinner"')
		expect(html).toContain('Start Shopping')
	})

	it('is disabled when the list has no items', () => {
		expect(render({ itemsCount: 0 })).toMatch(/<button[^>]*disabled=""/)
	})

	it('disappears while a shopping session is active: only one can run at a time', () => {
		// The page knows it from the server; the client store covers the rest, but it is not readable in a server render.
		expect(render({ sessionActive: true })).toBe('')
	})
})
