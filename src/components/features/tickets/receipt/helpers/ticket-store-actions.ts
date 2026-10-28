import { createStore, updateTicketStore } from '@/lib/api/endpoints'
import type { StoreRef } from '@/types'

/** Which of the four states the receipt's store card shows (see the user-stores spec). */
export type TicketStoreState =
	| { kind: 'confirmed'; store: StoreRef }
	| { kind: 'suggested'; store: StoreRef; rawName: string }
	| { kind: 'unmatched'; rawName: string }
	| { kind: 'unrecognized' }

export function getTicketStoreState(ticket: {
	store?: StoreRef | null
	store_suggestion?: StoreRef | null
	store_name?: string | null
}): TicketStoreState {
	if (ticket.store) return { kind: 'confirmed', store: ticket.store }
	const rawName = ticket.store_name?.trim() ?? ''
	if (ticket.store_suggestion && rawName) return { kind: 'suggested', store: ticket.store_suggestion, rawName }
	if (rawName) return { kind: 'unmatched', rawName }
	return { kind: 'unrecognized' }
}

export type StoreActionResult =
	/** `reused`: the name already belonged to a store, which the receipt now uses instead of a new one. */
	| { kind: 'done'; reused?: boolean }
	/** The store exists now but could not be put on the receipt: retrying only needs to assign it. */
	| { kind: 'assign-failed'; storeId: string; message: string }
	| { kind: 'error'; message: string }

type Actions = {
	create: typeof createStore
	assign: typeof updateTicketStore
}

const ACTIONS: Actions = { create: createStore, assign: updateTicketStore }

const ASSIGN_FAILED = 'We couldn’t put this store on the receipt. Try again.'

/** Puts one of the user's stores on the receipt, or removes it with null. */
export async function assignStore(ticketId: string, storeId: string | null, actions: Actions = ACTIONS): Promise<StoreActionResult> {
	try {
		const result = await actions.assign(ticketId, storeId)
		if (result.error) {
			return { kind: 'error', message: storeId ? ASSIGN_FAILED : 'We couldn’t remove the store from this receipt. Try again.' }
		}
		return { kind: 'done' }
	} catch {
		return { kind: 'error', message: 'Check your connection and try again.' }
	}
}

/**
 * Creates a store and puts it on the receipt. When the name already belongs to a store (the database also ignores
 * punctuation and branch numbers), that store is used instead of failing: it is the store the user means.
 */
export async function createAndAssignStore(ticketId: string, name: string, actions: Actions = ACTIONS): Promise<StoreActionResult> {
	let storeId: string | undefined
	let reused = false

	try {
		const created = await actions.create({ name })
		if (created.error) {
			const existing = (created.details as { store_id?: unknown } | undefined)?.store_id
			if (created.errorCode === 'CONFLICT' && typeof existing === 'string') {
				storeId = existing
				reused = true
			} else if (created.errorCode === 'LIMIT_EXCEEDED') {
				return { kind: 'error', message: created.error ?? 'You have reached the store limit. Merge stores to make room.' }
			} else {
				return { kind: 'error', message: 'We couldn’t save this store. Try again.' }
			}
		} else {
			storeId = created.data?.id
		}
	} catch {
		return { kind: 'error', message: 'Check your connection and try again.' }
	}

	if (!storeId) return { kind: 'error', message: 'We couldn’t save this store. Try again.' }

	const assigned = await assignStore(ticketId, storeId, actions)
	if (assigned.kind !== 'done') return { kind: 'assign-failed', storeId, message: ASSIGN_FAILED }
	return reused ? { kind: 'done', reused: true } : { kind: 'done' }
}
