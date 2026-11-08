import type { TicketItemMatch, TicketMatchesMeta } from '@/lib/api/endpoints/tickets'
import type { BaseList } from '@/components/features/tickets/add-to-list/helpers/merge-ticket-items'
import type { ReceiptTriageStatus } from './build-receipt-triage'

export type ReceiptTriageState = {
	status: ReceiptTriageStatus
	baseList: TicketMatchesMeta['base_list']
	baseLists: BaseList[]
	matches: TicketItemMatch[]
}

export type ReceiptTriageAction =
	| { type: 'loading' }
	/** Another target list was chosen: its comparison is on its way, and the screen keeps the triage layout meanwhile. */
	| { type: 'switching'; baseList: NonNullable<TicketMatchesMeta['base_list']> }
	| { type: 'ready'; baseList: TicketMatchesMeta['base_list']; baseLists: BaseList[]; matches: TicketItemMatch[] }
	| { type: 'failed' }
	| { type: 'unavailable' }

export function createReceiptTriageState(active: boolean): ReceiptTriageState {
	return { status: active ? 'loading' : 'unavailable', baseList: null, baseLists: [], matches: [] }
}

export function receiptTriageReducer(state: ReceiptTriageState, action: ReceiptTriageAction): ReceiptTriageState {
	switch (action.type) {
		case 'loading':
			return { ...state, status: 'loading' }
		case 'switching':
			return { ...state, status: 'switching', baseList: action.baseList }
		case 'ready':
			return { status: 'ready', baseList: action.baseList, baseLists: action.baseLists, matches: action.matches }
		case 'failed':
			return { ...state, status: 'failed' }
		case 'unavailable':
			return { status: 'unavailable', baseList: null, baseLists: [], matches: [] }
	}
}
