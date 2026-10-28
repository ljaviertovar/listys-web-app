'use client'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { getBaseLists, getTicketMatches } from '@/lib/api/endpoints'
import type { TicketItem } from '@/types'

import { buildReceiptTriage } from '../helpers/build-receipt-triage'
import { createReceiptTriageState, receiptTriageReducer } from '../helpers/receipt-triage-state'
import type { ReceiptTriageState } from '../helpers/receipt-triage-state'

interface UseReceiptTriageInput {
	ticketId: string
	items: TicketItem[]
	status: string
	attached: boolean
}

/** Loads the target list and its receipt matches only while this receipt can be reviewed. */
export function useReceiptTriage({ ticketId, items, status, attached }: UseReceiptTriageInput) {
	const active = status === 'completed' && !attached && items.length > 0
	const [state, dispatch] = useReducer(receiptTriageReducer, active, createReceiptTriageState)
	const [attempt, setAttempt] = useState(0)

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
		dispatch({ type: 'loading' })
		try {
			const result = await getTicketMatches(ticketId, baseListId)
			if (result.error || !result.meta?.base_list) {
				dispatch({ type: 'failed' })
				return
			}
			dispatch({ type: 'ready', baseList: result.meta.base_list, baseLists: state.baseLists, matches: result.data ?? [] })
		} catch {
			dispatch({ type: 'failed' })
		}
	}, [active, state.baseLists, ticketId])

	const retry = useCallback(() => setAttempt(value => value + 1), [])
	const triage = useMemo(() => state.status === 'ready' ? buildReceiptTriage(items, state.matches) : [], [items, state.matches, state.status])

	return { ...state, triage, changeList, retry }
}
