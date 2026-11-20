import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EntityCard } from '@/components/commons/entity-card/entity-card'
import { TicketCard } from '@/components/features/tickets/list/tickets-list'

const list = (overrides: Partial<Parameters<typeof EntityCard>[0]> = {}) =>
	renderToStaticMarkup(
		createElement(EntityCard, {
			href: '/base-lists/l1/edit',
			title: 'Pantry',
			description: 'Everything we buy every week.',
			facts: [{ value: 'Last trip 9 Nov' }],
			count: 12,
			unit: { one: 'item', many: 'items' },
			emptyLabel: 'items',
			linkLabel: 'View Items',
			menu: { label: 'More options for Pantry', actions: [] },
			testId: 'list-card-l1',
			...overrides,
		}),
	)

describe('Object card', () => {
	it('draws a list in the one rhythm: 16px padding, a 32px title row, a data line and a whole-card link', () => {
		const html = list()
		expect(html).toContain('data-size="object"')
		expect(html).toContain('min-h-8')
		expect(html).toContain('data-testid="list-card-l1-data"')
		expect(html).toContain('Last trip 9 Nov')
		expect(html).toContain('aria-label="View Items in Pantry"')
		expect(html).toContain('after:absolute after:inset-0')
		// The menu is 32px to see and 44px to hit, above the link.
		const menu = html.match(/<button[^>]*data-testid="list-card-l1-menu"[^>]*>/)?.[0] ?? ''
		expect(menu).toContain('size-8')
		expect(menu).toContain('z-10')
		expect(menu).toContain('-mr-1.5')
	})

	it('has no icon tile, and no data line when it has no facts', () => {
		const html = list({ facts: [null], description: null })
		expect(html).not.toContain('list-card-l1-icon')
		expect(html).not.toContain('list-card-l1-data')
	})

	it('reads zero as "No items yet" and keeps the resume action clear of the card link', () => {
		const empty = list({ count: 0 })
		expect(empty).toContain('No items yet')
		const resuming = list({ footerAction: createElement('button', { type: 'button' }, 'Resume Shopping') })
		expect(resuming).toContain('Resume Shopping')
		expect(resuming).not.toContain('after:absolute after:inset-0')
	})

	it('draws a receipt with the same title row, the amount first and the unconfirmed store as an action chip', () => {
		const html = renderToStaticMarkup(
			createElement(TicketCard, {
				id: 't1',
				title: 'Receipt · 10 Nov',
				status: 'completed',
				itemsCount: 54,
				photoCount: 2,
				uploadedAt: '2026-11-15T15:26:00Z',
				purchaseDate: null,
				totalLabel: '$281.45',
				storeName: null,
				storeConfirmed: false,
			} as never),
		)
		expect(html).toContain('data-size="object"')
		expect(html).toContain('Store not confirmed')
		expect(html.indexOf('Store not confirmed')).toBeLessThan(html.indexOf('$281.45'))
		expect(html).toContain('aria-label="View Details in Receipt · 10 Nov"')
		expect(html).toContain('photos')
	})

	const receipt = (overrides: Record<string, unknown> = {}) =>
		renderToStaticMarkup(
			createElement(TicketCard, {
				id: 't1',
				title: 'QA Lark Market Receipt',
				status: 'completed',
				itemsCount: 3,
				photoCount: 1,
				uploadedAt: '2026-11-18T14:28:00Z',
				purchaseDate: null,
				totalLabel: '$9.20',
				storeName: 'QA Lark Market',
				storeConfirmed: true,
				...overrides,
			} as never),
		)

	it('marks a receipt that counts in spending beside its amount, not among the chips', () => {
		const html = receipt({ includedInSpending: true, storeConfirmed: false })
		expect(html).toContain('data-testid="ticket-card-spending-t1"')
		expect(html).toContain('In spending')
		expect(html).not.toContain('Include in spending')
		// The warning keeps the chips row to itself; the marker comes with the amount, after it.
		expect(html.indexOf('Store not confirmed')).toBeLessThan(html.indexOf('$9.20'))
		expect(html.indexOf('$9.20')).toBeLessThan(html.indexOf('In spending'))
	})

	it('draws no chips row for a counted receipt whose store is confirmed', () => {
		const html = receipt({ includedInSpending: true })
		expect(html).toContain('In spending')
		expect(html).not.toContain('Store not confirmed')
		expect(html).not.toContain('data-testid="ticket-card-no-store-t1"')
	})

	it('says nothing about spending for a receipt left out of it', () => {
		const html = receipt({ includedInSpending: false })
		expect(html).not.toContain('In spending')
		expect(html).not.toContain('ticket-card-spending-t1')
	})
})
