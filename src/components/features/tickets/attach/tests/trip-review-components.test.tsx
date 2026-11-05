import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { AttachReviewLine } from '../helpers/build-attach-review'
import type { TicketSessionMatch } from '@/lib/api/endpoints'
import { ChangeLineSheet } from '../change-line-sheet'
import { TripReviewLineRow } from '../trip-review-line-row'
import { TripReviewSection } from '../trip-review-section'

vi.mock('@/components/commons', async importOriginal => ({
	...await importOriginal<typeof import('@/components/commons')>(),
	SheetDialog: ({ children, testId }: { children: React.ReactNode; testId: string }) => createElement('div', { 'data-testid': testId }, children),
}))

const line: AttachReviewLine = { id: 'a', ticketItemId: 'a', name: 'Milk', price: 4, decision: { kind: 'add' }, shoppingSessionItem: null, tag: null, result: 'Adds as a new item', canChange: true }

describe('trip review application controls', () => {
	it('offers exactly one change action for a readable line, and none for an unreadable one', () => {
		const render = (canChange: boolean) => renderToStaticMarkup(createElement(TripReviewLineRow, { line: { ...line, canChange }, onChange: () => {} }))
		expect(render(true).match(/aria-label="Change Milk"/g)).toHaveLength(1)
		expect(render(false)).not.toContain('<button')
	})
	it('omits empty sections and starts unpurchased missing items folded', () => {
		const props = { id: 'not-checked-not-on-receipt' as const, listName: 'Pantry', onChange: () => {} }
		expect(renderToStaticMarkup(createElement(TripReviewSection, props))).toBe('')
		const html = renderToStaticMarkup(createElement(TripReviewSection, { ...props, items: [{ id: 'bread', name: 'Bread', checked: false }] }))
		expect(html).toContain('aria-expanded="false"')
		expect(html).not.toContain('attach-review-missing-bread')
	})
	it('opens on the current line choice and disables Save until a trip item is available', () => {
		const html = renderToStaticMarkup(createElement(ChangeLineSheet, {
			line: { ...line, decision: { kind: 'match', itemId: 'milk' } },
			match: { ticket_item_id: 'a', match: 'name', shopping_session_item: { id: 'milk', name: 'Milk', checked: false } } satisfies TicketSessionMatch,
			items: [],
			listName: 'Pantry',
			onClose: () => {},
			onSave: () => {},
		}))

		expect(html).toContain('data-testid="change-line-sheet"')
		expect(html).toContain('data-testid="change-line-choice-match"')
		expect(html).toContain('aria-checked="true"')
		expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/)
	})
	it('keeps adding disabled for a name match and explains why', () => {
		const html = renderToStaticMarkup(createElement(ChangeLineSheet, {
			line,
			match: { ticket_item_id: 'a', match: 'name', shopping_session_item: { id: 'milk', name: 'Milk', checked: false } },
			items: [{ id: 'milk', name: 'Milk', checked: false, quantity: 1, unit: 'each' }],
			listName: 'Pantry',
			onClose: () => {},
			onSave: () => {},
		}))

		expect(html).toContain('data-testid="change-line-choice-add"')
		expect(html).toContain('Already matches a trip item.')
	})
})
