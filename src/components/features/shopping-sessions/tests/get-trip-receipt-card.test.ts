import { describe, expect, it } from 'vitest'

import { getTripReceiptCard } from '../helpers/get-trip-receipt-card'

const base = { justSaved: false, canManage: true, itemCount: 3, listName: 'Pantry', hasAvailableReceipts: false }

describe('getTripReceiptCard', () => {
	it('asks for the receipt right after the trip is saved, without a deadline or a per-store rule', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'none' }, justSaved: true })
		expect(card.title).toBe('Trip saved')
		expect(card.message).toContain('3 items updated in Pantry')
		expect(card.message).not.toMatch(/48|hours|per store|one per/i)
		expect(card.actions).toEqual(['upload', 'keep-separate'])
	})

	it('offers an uploaded receipt right after saving only when there is one to choose', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'none' }, justSaved: true, hasAvailableReceipts: true })
		expect(card.actions).toEqual(['upload', 'choose', 'keep-separate'])
	})

	it('says "1 item" in the singular', () => {
		expect(getTripReceiptCard({ ...base, state: { kind: 'none' }, justSaved: true, itemCount: 1 }).message).toContain('1 item updated')
	})

	it('highlights Add Receipt on a later visit, with no Keep It Separate and no deadline', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'none' } })
		expect(card.title).toBe('No receipt')
		expect(card.actions).toEqual(['add-receipt'])
		expect(card.message).not.toMatch(/48|hours/i)
	})

	it('only follows the reading, offering nothing to press', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'reading', ticketId: 't' } })
		expect(card.actions).toEqual([])
		expect(card.title).toContain('Reading')
	})

	it('offers the review once the receipt is read, without the review invitation itself', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'read', ticketId: 't' } })
		expect(card.actions).toEqual(['review'])
		expect(`${card.title} ${card.message}`).not.toContain('Review how this receipt will update the trip')
	})

	it('explains a failed reading and offers to open the receipt or add another', () => {
		const card = getTripReceiptCard({ ...base, state: { kind: 'failed', ticketId: 't' } })
		expect(card.title).toContain('couldn’t read')
		expect(card.actions).toEqual(['open-receipt', 'add-receipt'])
	})

	it.each([
		['none', { kind: 'none' }],
		['read', { kind: 'read', ticketId: 't' }],
		['failed', { kind: 'failed', ticketId: 't' }],
	] as const)('offers a viewer who did not run the trip no action in the %s state', (_label, state) => {
		expect(getTripReceiptCard({ ...base, state, canManage: false, justSaved: true }).actions).toEqual([])
	})
})
