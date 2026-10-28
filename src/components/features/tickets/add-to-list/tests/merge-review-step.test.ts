import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { LineDecision, MergeReview } from '../helpers/merge-review'
import { MergeReviewStep } from '../merge-review-step'

const MILK = { id: 'item-milk', name: '2% Milk 4L' }
const EGGS = { id: 'item-eggs', name: 'Eggs' }

const review: MergeReview = {
	byName: [{ ticketItemId: 'l-bread', name: 'BREAD', matchedItem: { id: 'item-bread', name: 'Bread' } }],
	remembered: [{ ticketItemId: 'l-milk', name: 'LECHE 2% 4L', matchedItem: MILK }],
	fresh: [{ ticketItemId: 'l-huevos', name: 'HUEVOS', matchedItem: null }],
	suggested: [],
	needsReview: true,
}

const render = (decisions: Array<[string, LineDecision]> = [], overrides: Partial<MergeReview> = {}) =>
	renderToStaticMarkup(
		createElement(MergeReviewStep, {
			review: { ...review, ...overrides },
			listItems: [MILK, EGGS],
			decisions: new Map(decisions),
			onDecide: () => {},
		}),
	)

describe('MergeReviewStep', () => {
	it('shows new lines, remembered matches (named as remembered) and a folded list of same-name updates', () => {
		const html = render()

		expect(html).toContain('New items')
		expect(html).toContain('Will be added as a new item')
		expect(html).toContain('Remembered matches')
		expect(html).toContain('Updates “2% Milk 4L” · remembered from an earlier receipt')
		expect(html).toContain('Updates by name')
		expect(html).not.toContain('>Bread<')
	})

	it('offers to link a new line, and to change or undo a remembered one', () => {
		const html = render()

		expect(html).toContain('aria-label="Link Huevos"')
		expect(html).toContain('aria-label="Change the item for Leche 2% 4l"')
		expect(html).toContain('aria-label="Add Leche 2% 4l as a new item"')
	})

	it('shows the user’s decisions: a linked new line and a remembered line added as new', () => {
		const html = render([
			['l-huevos', { kind: 'link', item: EGGS }],
			['l-milk', { kind: 'new' }],
		])

		expect(html).toContain('Updates “Eggs”')
		expect(html).not.toContain('remembered from an earlier receipt')
		expect(html.match(/Will be added as a new item/g)).toHaveLength(1)
	})

	it('leaves out sections with no lines', () => {
		const html = render([], { remembered: [], byName: [] })

		expect(html).toContain('New items')
		expect(html).not.toContain('Remembered matches')
		expect(html).not.toContain('Updates by name')
	})

	it('shows possible matches only when suggested lines exist', () => {
		const line = { ticketItemId: 'l-bananas', name: 'ORG BANANAS', matchedItem: null, suggestedItem: EGGS }
		expect(render([], { suggested: [line] })).toContain('Possible matches')
		expect(render([], { suggested: [line] })).toContain('Link to “Eggs”')
		expect(render()).not.toContain('Possible matches')
	})
})
