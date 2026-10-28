import { describe, expect, it } from 'vitest'

import { buildMergeLinks, buildMergeReview, resolvedItem, type LineDecision } from '../helpers/merge-review'

const MILK = { id: 'item-milk', name: '2% Milk 4L' }
const BREAD = { id: 'item-bread', name: 'Bread' }
const EGGS = { id: 'item-eggs', name: 'Eggs' }

const lines = [
	{ id: 'l-bread', name: 'BREAD' },
	{ id: 'l-milk', name: 'LECHE 2% 4L' },
	{ id: 'l-apples', name: 'APPLES' },
	{ id: 'l-huevos', name: 'HUEVOS' },
]

const matches = [
	{ ticket_item_id: 'l-bread', match: 'name' as const, base_list_item: BREAD, suggestion: null },
	{ ticket_item_id: 'l-milk', match: 'alias' as const, base_list_item: MILK, suggestion: null },
	{ ticket_item_id: 'l-apples', match: 'none' as const, base_list_item: null, suggestion: null },
	{ ticket_item_id: 'l-huevos', match: 'none' as const, base_list_item: null, suggestion: null },
]
const suggestedMatches = [...matches, {
	ticket_item_id: 'l-huevos',
	match: 'none' as const,
	base_list_item: null,
	suggestion: EGGS,
}]

describe('buildMergeReview', () => {
	it('needs no review step when every selected line matches by name', () => {
		const review = buildMergeReview(matches, lines, ['l-bread'])

		expect(review.needsReview).toBe(false)
		expect(review.byName.map(line => line.ticketItemId)).toEqual(['l-bread'])
	})

	it('sorts a mixed selection into by-name, remembered and new lines', () => {
		const review = buildMergeReview(matches, lines, ['l-bread', 'l-milk', 'l-apples'])

		expect(review.needsReview).toBe(true)
		expect(review.byName).toEqual([{ ticketItemId: 'l-bread', name: 'BREAD', matchedItem: BREAD }])
		expect(review.remembered).toEqual([{ ticketItemId: 'l-milk', name: 'LECHE 2% 4L', matchedItem: MILK }])
		expect(review.fresh).toEqual([{ ticketItemId: 'l-apples', name: 'APPLES', matchedItem: null }])
	})

	it('ignores lines that are not selected and treats an undescribed line as new', () => {
		const review = buildMergeReview(matches.slice(0, 2), lines, ['l-huevos'])

		expect(review.byName).toEqual([])
		expect(review.remembered).toEqual([])
		expect(review.fresh.map(line => line.ticketItemId)).toEqual(['l-huevos'])
	})

	it('places suggested unmatched lines in their own review group', () => {
		const review = buildMergeReview(suggestedMatches, lines, ['l-huevos'])

		expect(review.needsReview).toBe(true)
		expect(review.suggested).toEqual([{ ticketItemId: 'l-huevos', name: 'HUEVOS', matchedItem: null, suggestedItem: EGGS }])
		expect(review.fresh).toEqual([])
	})
})

describe('buildMergeLinks', () => {
	const review = buildMergeReview(matches, lines, ['l-bread', 'l-milk', 'l-apples', 'l-huevos'])

	it('sends nothing when every line keeps its default', () => {
		expect(buildMergeLinks(review, new Map())).toEqual([])
	})

	it('sends null for a remembered line the user adds as new (the link is forgotten)', () => {
		const decisions = new Map<string, LineDecision>([['l-milk', { kind: 'new' }]])
		expect(buildMergeLinks(review, decisions)).toEqual([{ ticket_item_id: 'l-milk', base_list_item_id: null }])
	})

	it('sends the new item for a remembered line moved to another item, and nothing when it stays on the same one', () => {
		const moved = new Map<string, LineDecision>([['l-milk', { kind: 'link', item: EGGS }]])
		const same = new Map<string, LineDecision>([['l-milk', { kind: 'link', item: MILK }]])

		expect(buildMergeLinks(review, moved)).toEqual([{ ticket_item_id: 'l-milk', base_list_item_id: EGGS.id }])
		expect(buildMergeLinks(review, same)).toEqual([])
	})

	it('sends a link for a new line linked to an item, and nothing for a new line kept new', () => {
		const decisions = new Map<string, LineDecision>([
			['l-huevos', { kind: 'link', item: EGGS }],
			['l-apples', { kind: 'new' }],
		])
		expect(buildMergeLinks(review, decisions)).toEqual([{ ticket_item_id: 'l-huevos', base_list_item_id: EGGS.id }])
	})

	it('sends no link for an untouched suggestion and sends the selected suggestion after acceptance', () => {
		const suggested = buildMergeReview(suggestedMatches, lines, ['l-huevos'])

		expect(buildMergeLinks(suggested, new Map())).toEqual([])
		expect(buildMergeLinks(suggested, new Map([['l-huevos', { kind: 'link', item: EGGS }]]))).toEqual([
			{ ticket_item_id: 'l-huevos', base_list_item_id: EGGS.id },
		])
	})

	it('never links a line that matches by name', () => {
		const decisions = new Map<string, LineDecision>([['l-bread', { kind: 'link', item: EGGS }]])
		expect(buildMergeLinks(review, decisions)).toEqual([])
	})
})

describe('resolvedItem', () => {
	it('follows the decision, else the default match', () => {
		const line = { ticketItemId: 'l-milk', name: 'LECHE', matchedItem: MILK }
		expect(resolvedItem(line, undefined)).toEqual(MILK)
		expect(resolvedItem(line, { kind: 'new' })).toBeNull()
		expect(resolvedItem(line, { kind: 'link', item: EGGS })).toEqual(EGGS)
	})
})
