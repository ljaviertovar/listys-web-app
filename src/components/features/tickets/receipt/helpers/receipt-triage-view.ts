import type { ReceiptTriageSection, ReceiptTriageStatus } from './build-receipt-triage'

/** The triage layout stays while another list is being compared, so the screen does not flash back to the category view. */
export function receiptItemsView(status: ReceiptTriageStatus | undefined): 'triage' | 'categories' {
	return status === 'ready' || status === 'switching' ? 'triage' : 'categories'
}

export function receiptBulkSelectionIds(sections: ReceiptTriageSection[], sectionId: string): string[] {
	if (sectionId !== 'matched') return []
	return sections.find(section => section.id === 'matched')?.lines.map(line => line.item.id) ?? []
}
