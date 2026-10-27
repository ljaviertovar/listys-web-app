import { createBaseListFromTicket, getBaseLists, mergeTicketItemsToBaseList } from '@/lib/api/endpoints'

import type { MergeLink } from './merge-review'

export type MergeMode = 'existing' | 'new'
export type BaseList = { id: string; name: string; created_at?: string | null }

/** With no list to add to, the only thing to do is to start one; otherwise the user's choice stands. */
export function modeForListCount(listCount: number, current: MergeMode): MergeMode {
	return listCount === 0 ? 'new' : current
}

type LoadActions = {
	getBaseLists: typeof getBaseLists
}

const LOAD_ACTIONS: LoadActions = { getBaseLists }

export async function loadMergeListTargets(actions: LoadActions = LOAD_ACTIONS) {
	const listsResult = await actions.getBaseLists()
	if (listsResult.error) throw new Error('Could not load lists')

	return {
		baseLists: (listsResult.data ?? []) as BaseList[],
	}
}

type SubmitActions = {
	merge: typeof mergeTicketItemsToBaseList
	create: typeof createBaseListFromTicket
}

const SUBMIT_ACTIONS: SubmitActions = {
	merge: mergeTicketItemsToBaseList,
	create: createBaseListFromTicket,
}

interface SubmitTicketItemsInput {
	mode: MergeMode
	ticketId: string
	selectedItemIds: string[]
	selectedBaseListId: string
	newListName: string
	/** Decisions from the Review Matches step; only sent when there are any. */
	links?: MergeLink[]
}

export type SubmitTicketItemsResult =
	| { kind: 'invalid'; message: string }
	| { kind: 'error'; message: string }
	| { kind: 'merged'; baseListId: string; counts?: { added: number; updated: number; skipped: number } }
	| { kind: 'created'; baseListId: string; itemCount: number }

export async function submitTicketItemsToList(
	input: SubmitTicketItemsInput,
	actions: SubmitActions = SUBMIT_ACTIONS,
): Promise<SubmitTicketItemsResult> {
	try {
		if (input.mode === 'existing') {
			if (!input.selectedBaseListId) return { kind: 'invalid', message: 'Choose a shopping list.' }

			const result = await actions.merge({
				ticket_id: input.ticketId,
				base_list_id: input.selectedBaseListId,
				items: input.selectedItemIds.map(id => ({ id, merge: true })),
				...(input.links && input.links.length > 0 ? { links: input.links } : {}),
			})
			if ('error' in result && result.error) {
				// A full list is something the user can fix in the review step, so it says how.
				if ('errorCode' in result && result.errorCode === 'LIMIT_EXCEEDED') {
					return { kind: 'error', message: 'This list can’t take that many new items. Link some lines to existing items, or add fewer.' }
				}
				return { kind: 'error', message: 'We couldn’t add these items to your list. Try again.' }
			}

			const counts = result as { new_count?: number; updated_count?: number; skipped_count?: number }
			const hasCounts = [counts.new_count, counts.updated_count, counts.skipped_count].every(Number.isFinite)

			return {
				kind: 'merged',
				baseListId: input.selectedBaseListId,
				...(hasCounts ? { counts: { added: counts.new_count!, updated: counts.updated_count!, skipped: counts.skipped_count! } } : {}),
			}
		}

		if (!input.newListName.trim()) return { kind: 'invalid', message: 'Enter a name for this list.' }

		const result = await actions.create({
			ticket_id: input.ticketId,
			name: input.newListName.trim(),
			item_ids: input.selectedItemIds,
		})
		if (result.error) {
			// A taken name is something the user can fix, so it gets its own message; anything else stays generic.
			if (result.errorCode === 'CONFLICT') return { kind: 'error', message: 'You already have a list with this name. Choose another name.' }
			return { kind: 'error', message: 'We couldn’t create your list. Try again.' }
		}

		return { kind: 'created', baseListId: result.data?.id ?? '', itemCount: input.selectedItemIds.length }
	} catch {
		return { kind: 'error', message: 'We couldn’t add these items. Check your connection and try again.' }
	}
}
