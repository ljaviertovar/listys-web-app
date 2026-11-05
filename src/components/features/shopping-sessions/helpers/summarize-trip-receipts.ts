import type { TripReceipt } from '@/types'

export type TripReceiptEntry = TripReceipt & { attached: boolean; ocr_status?: string | null }

/** Pending receipts never contribute to money paid; opening the review does not imply attachment. */
export function summarizeTripReceipts(receipts: ReadonlyArray<TripReceiptEntry>) {
	const attached = receipts.filter(receipt => receipt.attached)
	return {
		count: receipts.length,
		toReview: receipts.filter(receipt => !receipt.attached && receipt.ocr_status === 'completed').length,
		paid: attached.reduce((sum, receipt) => sum + (receipt.total_amount ?? 0), 0),
		hasKnownTotal: attached.some(receipt => receipt.total_amount !== null),
		storeCount: new Set(attached.flatMap(receipt => receipt.store ? [receipt.store.id] : [])).size,
	}
}
