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
	attachedReceipt,
	pendingReceipt,
}: {
	attachedReceipt: { id: string } | null | undefined
	pendingReceipt: { id: string; ocr_status: string | null } | null | undefined
}): TripReceiptState {
	if (attachedReceipt) return { kind: 'attached' }
	if (!pendingReceipt) return { kind: 'none' }

	const status = toTicketStatus(pendingReceipt.ocr_status)
	if (status === 'completed') return { kind: 'read', ticketId: pendingReceipt.id }
	if (status === 'failed') return { kind: 'failed', ticketId: pendingReceipt.id }
	return { kind: 'reading', ticketId: pendingReceipt.id }
}
