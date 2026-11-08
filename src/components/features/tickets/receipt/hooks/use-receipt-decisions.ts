'use client'

import { useCallback, useMemo, useReducer } from 'react'

import type { LineDecision } from '../../add-to-list/helpers/merge-review'
import { createReceiptDecisionsState, decisionsForList, receiptDecisionsReducer } from '../helpers/receipt-decisions-state'

/**
 * The matches decided on the receipt screen for the list being compared. `decide` answers with the line's previous
 * decision so the caller can offer Undo; deciding `null` clears the line.
 */
export function useReceiptDecisions(baseListId: string | null) {
	const [state, dispatch] = useReducer(receiptDecisionsReducer, undefined, createReceiptDecisionsState)
	const decisions = useMemo(() => decisionsForList(state, baseListId), [state, baseListId])

	const decide = useCallback((itemId: string, decision: LineDecision | null): LineDecision | null => {
		const previous = decisions.get(itemId) ?? null
		if (baseListId) dispatch({ type: 'decide', baseListId, itemId, decision })
		return previous
	}, [baseListId, decisions])

	const clear = useCallback(() => dispatch({ type: 'reset' }), [])

	return { decisions, decide, clear }
}
