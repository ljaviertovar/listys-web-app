'use client'

import { useState } from 'react'

import { getBaseList, getTicketMatches } from '@/lib/api/endpoints'

import { buildMergeLinks, buildMergeReview, type LineDecision, type MatchedItem, type MergeReview } from '../helpers/merge-review'

type ReviewState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'error' }
	| { status: 'ready'; review: MergeReview; listItems: MatchedItem[] }

interface LoadInput {
	ticketId: string
	baseListId: string
	lines: Array<{ id: string; name: string }>
	selectedIds: string[]
}

/**
 * The Review Matches step: how the selected lines match the chosen list, the list's items to link them to, and the user's
 * decision for each remembered or new line. `load` answers with the review so the caller can skip the step when nothing
 * needs a decision.
 */
export function useMergeReview() {
	const [state, setState] = useState<ReviewState>({ status: 'idle' })
	const [decisions, setDecisions] = useState<Map<string, LineDecision>>(new Map())
	const [lastInput, setLastInput] = useState<LoadInput | null>(null)

	const load = async (input: LoadInput): Promise<MergeReview | null> => {
		setLastInput(input)
		setDecisions(new Map())
		setState({ status: 'loading' })

		try {
			const [matches, list] = await Promise.all([getTicketMatches(input.ticketId, input.baseListId), getBaseList(input.baseListId)])
			if (matches.error || list.error) {
				setState({ status: 'error' })
				return null
			}

			const review = buildMergeReview(matches.data ?? [], input.lines, input.selectedIds)
			const listItems = ((list.data?.items ?? []) as Array<{ id: string; name: string }>)
				.map(item => ({ id: item.id, name: item.name }))
				.sort((a, b) => a.name.localeCompare(b.name))
			setState({ status: 'ready', review, listItems })
			return review
		} catch {
			setState({ status: 'error' })
			return null
		}
	}

	const retry = () => (lastInput ? load(lastInput) : Promise.resolve(null))

	const decide = (ticketItemId: string, decision: LineDecision | null) => {
		setDecisions(current => {
			const next = new Map(current)
			if (decision) next.set(ticketItemId, decision)
			else next.delete(ticketItemId)
			return next
		})
	}

	const reset = () => {
		setState({ status: 'idle' })
		setDecisions(new Map())
		setLastInput(null)
	}

	const links = state.status === 'ready' ? buildMergeLinks(state.review, decisions) : []

	return { state, decisions, decide, load, retry, reset, links }
}
