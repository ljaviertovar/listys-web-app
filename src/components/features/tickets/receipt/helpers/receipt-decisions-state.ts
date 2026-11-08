import type { LineDecision } from '../../add-to-list/helpers/merge-review'

/**
 * The matches the user decided on the receipt screen. They are about one target list's items, so they carry the list they
 * were made against and stop applying the moment another list is the target.
 */
export type ReceiptDecisionsState = {
	baseListId: string | null
	decisions: ReadonlyMap<string, LineDecision>
}

export type ReceiptDecisionsAction =
	| { type: 'decide'; baseListId: string; itemId: string; decision: LineDecision | null }
	| { type: 'reset' }

const NO_DECISIONS: ReadonlyMap<string, LineDecision> = new Map()

export function createReceiptDecisionsState(): ReceiptDecisionsState {
	return { baseListId: null, decisions: NO_DECISIONS }
}

/** A `null` decision takes the line back to its undecided state (what Undo does for a line that had none). */
export function receiptDecisionsReducer(state: ReceiptDecisionsState, action: ReceiptDecisionsAction): ReceiptDecisionsState {
	switch (action.type) {
		case 'decide': {
			const next = new Map(state.baseListId === action.baseListId ? state.decisions : NO_DECISIONS)
			if (action.decision) next.set(action.itemId, action.decision)
			else next.delete(action.itemId)
			return { baseListId: action.baseListId, decisions: next }
		}
		case 'reset':
			return createReceiptDecisionsState()
	}
}

/** The decisions that apply to the list being compared; those made against another list are not shown. */
export function decisionsForList(state: ReceiptDecisionsState, baseListId: string | null): ReadonlyMap<string, LineDecision> {
	return baseListId !== null && state.baseListId === baseListId ? state.decisions : NO_DECISIONS
}
