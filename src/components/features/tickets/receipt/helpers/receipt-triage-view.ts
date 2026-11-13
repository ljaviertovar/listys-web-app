import type { ReceiptTriageSection, ReceiptTriageStatus } from './build-receipt-triage'

/** Keep the review layout while the initial comparison or a list change is loading. */
export function receiptItemsView(status: ReceiptTriageStatus | undefined): 'triage' | 'categories' {
	return status === 'loading' || status === 'ready' || status === 'switching' ? 'triage' : 'categories'
}

export function receiptBulkSelectionIds(sections: ReceiptTriageSection[], sectionId: string): string[] {
	if (sectionId !== 'matched') return []
	return sections.find(section => section.id === 'matched')?.lines.map(line => line.item.id) ?? []
}
