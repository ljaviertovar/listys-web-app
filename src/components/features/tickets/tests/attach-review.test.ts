import { describe, expect, it } from 'vitest'
import { getReceiptAttachmentVisibility, getReceiptTripSurface, shouldShowAttachCard } from '../attach/helpers/receipt-attachment-visibility'

describe('receipt attachment visibility', () => {
	it('shows the attach card only for an eligible unread-list state and hides list actions after attachment', () => {
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: false, candidateCount: 1 })).toBe(true)
		expect(shouldShowAttachCard({ read: false, attached: false, addedToList: false, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: true, addedToList: false, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: true, candidateCount: 1 })).toBe(false)
		expect(shouldShowAttachCard({ read: true, attached: false, addedToList: false, candidateCount: 0 })).toBe(false)
		expect(getReceiptAttachmentVisibility(false)).toEqual({ showSelectionBar: true, showMergeDialog: true, showAttachedState: false })
		expect(getReceiptAttachmentVisibility(true)).toEqual({ showSelectionBar: false, showMergeDialog: false, showAttachedState: true })
	})

	it('mentions trips only on a receipt that was uploaded from one', () => {
		const surface = (attached: boolean, addedToList: boolean, uploadedFromTrip: boolean) =>
			getReceiptTripSurface({ attached, addedToList, uploadedFromTrip })

		expect(surface(false, false, true)).toBe('attach-card')
		expect(surface(false, true, true)).toBe('added-to-list-note')
		expect(surface(true, false, true)).toBe('none')
		expect(surface(false, false, false)).toBe('none')
		expect(surface(false, true, false)).toBe('none')
	})
})
