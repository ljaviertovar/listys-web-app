import type { TripReceiptState } from './get-trip-receipt-state'

export type TripReceiptAction = 'upload' | 'review' | 'open-receipt' | 'view-trip'
export type TripReceiptCardModel = { title: string; message: string; actions: TripReceiptAction[] }

/** Only the person who ran the trip gets actions; receipt state never changes the trip's completion state. */
export function getTripReceiptCard({ state, justSaved, canManage, itemCount, listName }: {
	state: Exclude<TripReceiptState, { kind: 'attached' }>
	justSaved: boolean
	canManage: boolean
	itemCount: number
	listName: string
}): TripReceiptCardModel {
	switch (state.kind) {
		case 'reading': return { title: 'Reading your receipt…', message: 'This takes a few seconds. You can leave this page; we keep reading.', actions: [] }
		case 'read': return { title: 'Your receipt is ready', message: 'Check it against this trip before anything changes.', actions: [] }
		case 'failed': return { title: 'We couldn’t read this receipt', message: 'Open it to try again, or upload a different receipt.', actions: canManage ? ['open-receipt', 'upload'] : [] }
		case 'none': return justSaved
			? { title: 'Trip saved', message: `${itemCount} ${itemCount === 1 ? 'item' : 'items'} updated in ${listName}. Add your receipt to save the real prices and the total.`, actions: canManage ? ['upload', 'view-trip'] : [] }
			: { title: 'No receipt', message: canManage ? 'Add a receipt to save the real total and prices.' : 'No receipt is attached to this trip yet.', actions: canManage ? ['upload'] : [] }
	}
}
