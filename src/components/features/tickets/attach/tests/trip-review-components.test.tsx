import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { AttachReviewLine } from '../helpers/build-attach-review'
import { TripReviewLineRow } from '../trip-review-line-row'
import { TripReviewSection } from '../trip-review-section'

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
})
