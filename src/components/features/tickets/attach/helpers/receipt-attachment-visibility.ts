export function getReceiptAttachmentVisibility(attached: boolean) {
	return {
		showSelectionBar: !attached,
		showMergeDialog: !attached,
		showAttachedState: attached,
	}
}

export function shouldShowAttachCard({
	read,
	attached,
	addedToList,
	candidateCount,
}: {
	read: boolean
	attached: boolean
	addedToList: boolean
	candidateCount: number
}) {
	return read && !attached && !addedToList && candidateCount > 0
}

export type ReceiptTripSurface = 'attach-card' | 'added-to-list-note' | 'none'

/**
 * What the receipt screen says about trips. A receipt is only ever offered the trip it was uploaded from, so a receipt
 * uploaded anywhere else mentions no trip at all (not even the "added to a list" note).
 */
export function getReceiptTripSurface({
	attached,
	addedToList,
	uploadedFromTrip,
}: {
	attached: boolean
	addedToList: boolean
	uploadedFromTrip: boolean
}): ReceiptTripSurface {
	if (attached || !uploadedFromTrip) return 'none'
	return addedToList ? 'added-to-list-note' : 'attach-card'
}
