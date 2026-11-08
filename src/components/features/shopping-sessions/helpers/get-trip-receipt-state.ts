import { toTicketStatus } from '@/components/features/tickets/helpers/ticket-status'

export type TripReceiptState =
	| { kind: 'attached' }
	| { kind: 'none' }
	| { kind: 'reading'; ticketId: string }
	| { kind: 'read'; ticketId: string }
	| { kind: 'failed'; ticketId: string }

/**
 * Where a completed trip stands with its receipt. `pendingReceipt` is the most recent receipt uploaded from this trip that is
 * attached nowhere and not added to a list: while it is read the trip waits, once read the trip offers the review, and if
 * reading failed the trip says so. An attached receipt settles everything else.
 */
export function getTripReceiptState({
	receipts,
	pendingReceipt,
}: {
	receipts: ReadonlyArray<{ id: string }> | null | undefined
	pendingReceipt: { id: string; ocr_status: string | null; total_items?: number | null } | null | undefined
}): TripReceiptState {
	if (!pendingReceipt) return receipts?.length ? { kind: 'attached' } : { kind: 'none' }

	const status = toTicketStatus(pendingReceipt.ocr_status, pendingReceipt.total_items)
	if (status === 'completed') return { kind: 'read', ticketId: pendingReceipt.id }
	if (status === 'failed') return { kind: 'failed', ticketId: pendingReceipt.id }
	return { kind: 'reading', ticketId: pendingReceipt.id }
}
