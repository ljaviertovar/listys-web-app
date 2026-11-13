export type TripReceiptFlow = { upload: boolean; reviewTicketId: string | null }
export type TripReceiptFlowAction =
	| { type: 'upload-new' }
	| { type: 'set-upload'; open: boolean }
	| { type: 'review'; ticketId: string }
	| { type: 'close-review' }

export function createTripReceiptFlow(openUpload = false): TripReceiptFlow {
	return { upload: openUpload, reviewTicketId: null }
}

/** A new upload or a review can be in front of the user, never both. Closing sends no attachment. */
export function tripReceiptFlowReducer(flow: TripReceiptFlow, action: TripReceiptFlowAction): TripReceiptFlow {
	switch (action.type) {
		case 'upload-new': return { upload: true, reviewTicketId: null }
		case 'set-upload': return { ...flow, upload: action.open }
		case 'review': return { upload: false, reviewTicketId: action.ticketId }
		case 'close-review': return { ...flow, reviewTicketId: null }
	}
}
