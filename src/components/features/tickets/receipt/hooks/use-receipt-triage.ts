'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { getBaseLists, getTicketMatches } from '@/lib/api/endpoints'
import type { TicketItem } from '@/types'

import { buildReceiptTriage } from '../helpers/build-receipt-triage'
import { createReceiptTriageState, receiptTriageReducer } from '../helpers/receipt-triage-state'
import { useReceiptDecisions } from './use-receipt-decisions'
import { useReceiptMatchActions } from './use-receipt-match-actions'
import type { ReceiptTriageState } from '../helpers/receipt-triage-state'

interface UseReceiptTriageInput {
	ticketId: string
	items: TicketItem[]
	status: string
	attached: boolean
}

/**
 * Loads the target list and its receipt matches only while this receipt can be reviewed, and holds the matches the user
 * decides on the screen against that list (they are dropped when another list becomes the target).
 */
export function useReceiptTriage({ ticketId, items, status, attached }: UseReceiptTriageInput) {
	const active = status === 'completed' && !attached && items.length > 0
	const [state, dispatch] = useReducer(receiptTriageReducer, active, createReceiptTriageState)
	const [attempt, setAttempt] = useState(0)
	// The list the user chose last; a failed comparison is retried against it, not against the default list.
	const [requestedListId, setRequestedListId] = useState<string | null>(null)
	// Only the answer to the latest choice may land, so a slow earlier list cannot overwrite a later one.
	const latestRequest = useRef(0)
	const { decisions, decide, clear: clearDecisions } = useReceiptDecisions(state.baseList?.id ?? null)
	const actions = useReceiptMatchActions({ items, baseListId: state.baseList?.id ?? null, decisions, decide })

	useEffect(() => {
		if (!active) {
			dispatch({ type: 'unavailable' })
			return
		}

		let cancelled = false
		dispatch({ type: 'loading' })

		Promise.all([getTicketMatches(ticketId), getBaseLists()]).then(([matchesResult, listsResult]) => {
			if (cancelled) return
			if (matchesResult.error || listsResult.error) {
				dispatch({ type: 'failed' })
				return
			}

			const baseLists = (listsResult.data ?? []) as ReceiptTriageState['baseLists']
			const baseList = matchesResult.meta?.base_list ?? null
			if (!baseList || baseLists.length === 0) {
				dispatch({ type: 'unavailable' })
				return
			}
			dispatch({ type: 'ready', baseList, baseLists, matches: matchesResult.data ?? [] })
		}).catch(() => {
			if (!cancelled) dispatch({ type: 'failed' })
		})

		return () => {
			cancelled = true
		}
	}, [active, attempt, ticketId])

	const changeList = useCallback(async (baseListId: string) => {
		if (!active) return
		setRequestedListId(baseListId)
		// Matches decided against the previous list mean nothing for another one, and must not come back if the user returns.
		if (baseListId !== state.baseList?.id) clearDecisions()
		const request = ++latestRequest.current
		const chosen = state.baseLists.find(list => list.id === baseListId)
		dispatch(chosen ? { type: 'switching', baseList: { id: chosen.id, name: chosen.name } } : { type: 'loading' })
		try {
			const result = await getTicketMatches(ticketId, baseListId)
			if (request !== latestRequest.current) return
			if (result.error || !result.meta?.base_list) {
				dispatch({ type: 'failed' })
				return
			}
			dispatch({ type: 'ready', baseList: result.meta.base_list, baseLists: state.baseLists, matches: result.data ?? [] })
		} catch {
			if (request === latestRequest.current) dispatch({ type: 'failed' })
		}
	}, [active, state.baseList?.id, state.baseLists, ticketId, clearDecisions])

	const retry = useCallback(() => {
		if (requestedListId) void changeList(requestedListId)
		else setAttempt(value => value + 1)
	}, [requestedListId, changeList])
	const triage = useMemo(
		() => state.status === 'ready' ? buildReceiptTriage(items, state.matches, decisions) : [],
		[items, state.matches, state.status, decisions],
	)

	return { ...state, triage, decisions, actions, clearDecisions, changeList, retry }
}
