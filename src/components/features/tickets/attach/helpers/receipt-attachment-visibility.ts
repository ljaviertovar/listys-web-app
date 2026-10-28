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
