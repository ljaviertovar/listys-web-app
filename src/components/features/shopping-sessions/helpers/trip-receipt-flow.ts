import type { TripReceiptState } from './get-trip-receipt-state'

/** Which of the trip card's sheets is open, and which receipt is being reviewed. At most one thing is in front of the user. */
export type TripReceiptFlow = {
	add: boolean
	upload: boolean
	choose: boolean
	/** The receipt whose review is open; the review is only ever mounted for a receipt that was chosen or read. */
	reviewTicketId: string | null
}

export type TripReceiptFlowAction =
	| { type: 'open-add' }
	| { type: 'set-add'; open: boolean }
	| { type: 'upload-new' }
	| { type: 'set-upload'; open: boolean }
	| { type: 'choose-uploaded' }
	| { type: 'set-choose'; open: boolean }
	| { type: 'review'; ticketId: string }
	| { type: 'close-review' }

/**
 * Whether the Add Receipt choice is already open on arrival. A trip card in Trips links here with `receipt=add` to say the
 * user wants to add a receipt; that only makes sense for someone who can, and for a trip that has none usable yet.
 */
export function shouldOpenAddOnLoad({
	requested,
	canManage,
	state,
}: {
	requested: boolean
	canManage: boolean
	state: Exclude<TripReceiptState, { kind: 'attached' }>
}) {
	return requested && canManage && (state.kind === 'none' || state.kind === 'failed')
}

export function createTripReceiptFlow(openAdd: boolean): TripReceiptFlow {
	return { add: openAdd, upload: false, choose: false, reviewTicketId: null }
}

export function tripReceiptFlowReducer(flow: TripReceiptFlow, action: TripReceiptFlowAction): TripReceiptFlow {
	switch (action.type) {
		case 'open-add':
			return { ...flow, add: true }
		case 'set-add':
			return { ...flow, add: action.open }
		case 'upload-new':
			return { ...flow, add: false, choose: false, upload: true }
		case 'set-upload':
			return { ...flow, upload: action.open }
		case 'choose-uploaded':
			return { ...flow, add: false, choose: true }
		case 'set-choose':
			return { ...flow, choose: action.open }
		// Choosing a receipt, or pressing Review Receipt on one that is ready, opens its review. Nothing is attached yet.
		case 'review':
			return { ...flow, add: false, choose: false, reviewTicketId: action.ticketId }
		case 'close-review':
			return { ...flow, reviewTicketId: null }
	}
}
