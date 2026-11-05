import { describe, expect, it } from 'vitest'

import type { TicketSessionCandidate, TicketSessionMatch } from '@/lib/api/endpoints'
import { buildAttachReview } from '../helpers/build-attach-review'

const candidate: TicketSessionCandidate = { id: 'trip', name: 'Weekly trip', status: 'active', started_at: null, completed_at: null, store: null, base_list: { id: 'list', name: 'Pantry' }, checked_count: 0, item_count: 2 }
const milk = { id: 'milk', name: 'Milk', checked: false, quantity: 2, unit: 'each' }
const lines = [{ id: 'batteries', name: 'Batteries' }, { id: 'fee', name: 'BAG FEE' }, { id: 'milk-line', name: 'Milk', quantity: 3, price: 6 }]
const matches: TicketSessionMatch[] = [{ ticket_item_id: 'milk-line', match: 'name', shopping_session_item: milk }]
const base = { candidate, lines, matches, sessionItems: [milk], receiptStore: null, totalAmount: null }

describe('attach review decisions and request', () => {
	it('adds Batteries by default, leaves BAG FEE out, and sends no override for a name match', () => {
		const review = buildAttachReview({ ...base, decisions: new Map([['fee', { kind: 'leave' }]]) })
		expect(review.payload).toEqual({ shopping_session_id: 'trip', added_item_ids: ['batteries'] })
		expect(review.counts).toEqual({ matched: 1, added: 1, leftOut: 1 })
		expect(review.sections.map(section => section.id)).toEqual(['new', 'will-be-checked', 'already-checked', 'left-out'])
	})
	it('updates counters and missing-item lists when a matched line is left out', () => {
		const review = buildAttachReview({ ...base, decisions: new Map([['milk-line', { kind: 'leave' }]]) })
		expect(review.counts).toEqual({ matched: 0, added: 2, leftOut: 1 })
		expect(review.notCheckedNotOnReceipt).toEqual([milk])
		expect(buildAttachReview({ ...base, sessionItems: [{ ...milk, checked: true }], decisions: new Map([['milk-line', { kind: 'leave' }]]) }).checkedNotOnReceipt).toHaveLength(1)
	})
	it('uses the actual target name and checked state for a manual link', () => {
		const review = buildAttachReview({ ...base, decisions: new Map([['batteries', { kind: 'match', itemId: 'milk' }]]) })
		expect(review.sections[1].lines[0].shoppingSessionItem).toEqual(milk)
		expect(review.sections[1].lines[0].tag).toBe('No price')
		expect(review.payload.links).toEqual([{ ticket_item_id: 'batteries', shopping_session_item_id: 'milk' }])
	})
	it('does not report items on another receipt as missing and sums known quantities', () => {
		const review = buildAttachReview({ ...base, lines: [lines[2]], coveredItemIds: new Set(['milk', 'eggs']), sessionItems: [milk, { id: 'eggs', name: 'Eggs', checked: true }], previousLines: [{ shopping_session_item_id: 'milk', quantity: 2, unit: 'each' }] })
		expect(review.checkedNotOnReceipt).toEqual([])
		expect(review.notCheckedNotOnReceipt).toEqual([])
		expect(review.sections[2].lines[0].result).toContain('usual quantity 2 → 5')
		expect(review.allMatch).toBe(true)
	})
	it('preserves the original trip store when a receipt comes from a second store', () => {
		const store = { id: 'original', name: 'No Frills' }
		const review = buildAttachReview({ ...base, candidate: { ...candidate, store }, receiptStore: { id: 'second', name: 'Costco' } })
		expect(review.resultingStore).toEqual(store)
		expect(review.storeMismatch).toBe(false)
	})
})
