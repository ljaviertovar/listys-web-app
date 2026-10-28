import { describe, expect, it } from 'vitest'

import { buildAttachReview, getAttachDialogStage } from '../attach/helpers/build-attach-review'
import { getReceiptAttachmentVisibility, shouldShowAttachCard } from '../attach/helpers/receipt-attachment-visibility'

const candidate = (overrides: Record<string, unknown> = {}) => ({
	id: 'session-1',
	name: 'Weekly shop',
	status: 'active',
	started_at: null,
	completed_at: null,
	store: null,
	base_list: { id: 'list-1', name: 'Groceries' },
	checked_count: 0,
	item_count: 2,
	...overrides,
})

describe('buildAttachReview', () => {
	it('groups checked, newly checked, added and unselected receipt lines and builds the request', () => {
		const review = buildAttachReview({
			candidate: candidate(),
			lines: [{ id: 'line-1', name: 'Milk' }, { id: 'line-2', name: 'Bread' }, { id: 'line-3', name: 'Apples' }, { id: 'line-4', name: 'Coffee' }],
			matches: [
				{ ticket_item_id: 'line-1', match: 'name', shopping_session_item: { id: 'item-1', name: 'Milk', checked: true } },
				{ ticket_item_id: 'line-2', match: 'alias', shopping_session_item: { id: 'item-2', name: 'Bread', checked: false } },
			],
			receiptStore: { id: 'store-1', name: 'Market' },
			totalAmount: 42.5,
			addedItemIds: ['line-3'],
		})

		expect(review.alreadyChecked.map(line => line.name)).toEqual(['Milk'])
		expect(review.willBeChecked.map(line => line.name)).toEqual(['Bread', 'Apples'])
		expect(review.notInTrip.map(line => line.name)).toEqual(['Coffee'])
		expect(review.resultingStore).toEqual({ id: 'store-1', name: 'Market' })
		expect(review.confirmLabel).toBe('Attach and Complete Trip')
		expect(review.payload).toEqual({ shopping_session_id: 'session-1', added_item_ids: ['line-3'], total_amount: 42.5 })
	})

	it('links an unmatched line and does not overwrite a completed session store', () => {
		const review = buildAttachReview({
			candidate: candidate({ status: 'completed', store: { id: 'store-1', name: 'Market' } }),
			lines: [{ id: 'line-1', name: 'Milk' }],
			matches: [{ ticket_item_id: 'line-1', match: 'none', shopping_session_item: null }],
			receiptStore: { id: 'store-2', name: 'Other Market' },
			totalAmount: null,
			linkedItems: new Map([['line-1', 'item-9']]),
		})

		expect(review.willBeChecked[0].shoppingSessionItem?.id).toBe('item-9')
		expect(review.notInTrip).toEqual([])
		expect(review.resultingStore).toEqual({ id: 'store-1', name: 'Market' })
		expect(review.confirmLabel).toBe('Attach to Trip')
		expect(review.storeMismatch).toBe(true)
		expect(review.payload.links).toEqual([{ ticket_item_id: 'line-1', shopping_session_item_id: 'item-9' }])
	})

	it('shows the selected session item name and checked state for a manual link', () => {
		const review = buildAttachReview({
			candidate: candidate(),
			lines: [{ id: 'line-1', name: 'Blackberries 6oz' }],
			matches: [{ ticket_item_id: 'line-1', match: 'none', shopping_session_item: null }],
			sessionItems: [{ id: 'item-1', name: 'Blackberry', checked: true }],
			receiptStore: null,
			totalAmount: null,
			linkedItems: new Map([['line-1', 'item-1']]),
		})

		expect(review.alreadyChecked).toEqual([{
			ticketItemId: 'line-1',
			name: 'Blackberries 6oz',
			shoppingSessionItem: { id: 'item-1', name: 'Blackberry', checked: true },
		}])
		expect(review.willBeChecked).toEqual([])
		expect(review.payload.links).toEqual([{ ticket_item_id: 'line-1', shopping_session_item_id: 'item-1' }])
	})

	it('chooses review immediately for one candidate and asks when there are several', () => {
		expect(getAttachDialogStage(1, null)).toBe('review')
		expect(getAttachDialogStage(3, null)).toBe('choose')
		expect(getAttachDialogStage(3, 'session-2')).toBe('review')
	})

	it('shows the attach card only for an eligible unread-list state and hides list actions after attachment', () => {
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: false, candidateCount: 1 })).toBe(true)
		expect(shouldShowAttachCard({ read: false, attached: false, addedToList: false, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: true, addedToList: false, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: true, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: false, candidateCount: 0 })).toBe(false)
		expect(getReceiptAttachmentVisibility(false)).toEqual({ showSelectionBar: true, showMergeDialog: true, showAttachedState: false })
		expect(getReceiptAttachmentVisibility(true)).toEqual({ showSelectionBar: false, showMergeDialog: false, showAttachedState: true })
	})
})
