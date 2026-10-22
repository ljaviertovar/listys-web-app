import { createBaseListFromTicket, getBaseLists, getGroups, mergeTicketItemsToBaseList } from '@/lib/api/endpoints'

export type MergeMode = 'existing' | 'new'
export type Group = { id: string; name: string }
export type BaseList = { id: string; name: string; group_id: string }

type LoadActions = {
	getGroups: typeof getGroups
	getBaseLists: typeof getBaseLists
}

const LOAD_ACTIONS: LoadActions = { getGroups, getBaseLists }

export async function loadMergeListTargets(actions: LoadActions = LOAD_ACTIONS) {
	const [groupsResult, listsResult] = await Promise.all([actions.getGroups(), actions.getBaseLists()])
	if (groupsResult.error || listsResult.error) throw new Error('Could not load lists')

	return {
		groups: groupsResult.data ?? [],
		baseLists: listsResult.data ?? [],
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
	selectedGroupId: string
	newListName: string
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
			})
			if ('error' in result && result.error) return { kind: 'error', message: 'We couldn’t add these items to your list. Try again.' }

			const counts = result as { new_count?: number; updated_count?: number; skipped_count?: number }
			const hasCounts = [counts.new_count, counts.updated_count, counts.skipped_count].every(Number.isFinite)

			return {
				kind: 'merged',
				baseListId: input.selectedBaseListId,
				...(hasCounts ? { counts: { added: counts.new_count!, updated: counts.updated_count!, skipped: counts.skipped_count! } } : {}),
			}
		}

		if (!input.newListName.trim()) return { kind: 'invalid', message: 'Enter a name for this list.' }
		if (!input.selectedGroupId) return { kind: 'invalid', message: 'Select a group first.' }

		const result = await actions.create({
			ticket_id: input.ticketId,
			group_id: input.selectedGroupId,
			name: input.newListName.trim(),
			item_ids: input.selectedItemIds,
		})
		if (result.error) return { kind: 'error', message: 'We couldn’t create your list. Try again.' }

		return { kind: 'created', baseListId: result.data?.id ?? '', itemCount: input.selectedItemIds.length }
	} catch {
		return { kind: 'error', message: 'We couldn’t add these items. Check your connection and try again.' }
	}
}
