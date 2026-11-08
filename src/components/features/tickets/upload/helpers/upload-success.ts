/**
 * What happens after a receipt went up. From a trip the user stays on the trip, which shows the receipt being read and offers
 * the review when it is ready; from anywhere else the app opens the receipt, as it always has.
 */
export function getUploadSuccessOutcome({ ticketId, fromTrip }: { ticketId: string | null; fromTrip: boolean }): {
	toastDescription: string
	openReceiptId: string | null
} {
	if (fromTrip) {
		return { toastDescription: 'We’re reading it. You can review it here once it’s ready.', openReceiptId: null }
	}
	return {
		toastDescription: ticketId ? 'Opening your receipt…' : 'You can review its progress in your receipts.',
		openReceiptId: ticketId,
	}
}
