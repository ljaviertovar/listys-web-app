import type { ReceiptTriageSection, ReceiptTriageStatus } from './build-receipt-triage'

export function receiptItemsView(status: ReceiptTriageStatus | undefined): 'triage' | 'categories' {
	return status === 'ready' ? 'triage' : 'categories'
}

export function receiptBulkSelectionIds(sections: ReceiptTriageSection[], sectionId: string): string[] {
	if (sectionId !== 'matched') return []
	return sections.find(section => section.id === 'matched')?.lines.map(line => line.item.id) ?? []
}
