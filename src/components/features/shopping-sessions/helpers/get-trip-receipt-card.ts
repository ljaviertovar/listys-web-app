import type { TripReceiptState } from './get-trip-receipt-state'

export type TripReceiptAction = 'add-receipt' | 'upload' | 'choose' | 'review' | 'open-receipt' | 'keep-separate'

export type TripReceiptCardModel = {
	title: string
	message: string
	actions: TripReceiptAction[]
}

/**
 * What the receipts card of a completed trip says and offers for each state of its receipt. Only the viewer who ran the trip
 * gets actions; everyone else is told the state. The review text ("Review how this receipt will update the trip") is not
 * here: it belongs to the review itself, which opens only once a receipt is ready.
 */
export function getTripReceiptCard({
	state,
	justSaved,
	canManage,
	itemCount,
	listName,
	hasAvailableReceipts,
}: {
	state: Exclude<TripReceiptState, { kind: 'attached' }>
	justSaved: boolean
	canManage: boolean
	itemCount: number
	listName: string
	hasAvailableReceipts: boolean
}): TripReceiptCardModel {
	switch (state.kind) {
		case 'reading':
			return {
				title: 'Reading your receipt…',
				message: 'This takes a few seconds. You can leave this page; we keep reading.',
				actions: [],
			}
		case 'read':
			return {
				title: 'Your receipt is ready',
				message: 'Check it against this trip before anything changes.',
				actions: canManage ? ['review'] : [],
			}
		case 'failed':
			return {
				title: 'We couldn’t read this receipt',
				message: 'Open it to try again, or add a different receipt.',
				actions: canManage ? ['open-receipt', 'add-receipt'] : [],
			}
		case 'none':
			if (justSaved) {
				return {
					title: 'Trip saved',
					message: `${itemCount} ${itemCount === 1 ? 'item' : 'items'} updated in ${listName}. Add your receipt to save the real prices and the total.`,
					actions: canManage ? ['upload', ...(hasAvailableReceipts ? (['choose'] as const) : []), 'keep-separate'] : [],
				}
			}
			return {
				title: 'No receipt',
				message: canManage ? 'Add a receipt to save the real total and prices.' : 'No receipt is attached to this trip yet.',
				actions: canManage ? ['add-receipt'] : [],
			}
	}
}
