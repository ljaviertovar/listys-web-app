import { mergeStores, renameStore } from '@/lib/api/endpoints'

export type RenameResult =
	| { kind: 'done' }
	/** Another store already has the name: the way out is to merge into it. */
	| { kind: 'conflict'; storeId: string }
	| { kind: 'error'; message: string }

export type MergeResult = { kind: 'done' } | { kind: 'error'; message: string }

type Actions = { rename: typeof renameStore; merge: typeof mergeStores }

const ACTIONS: Actions = { rename: renameStore, merge: mergeStores }

export async function renameStoreAction(storeId: string, name: string, actions: Actions = ACTIONS): Promise<RenameResult> {
	try {
		const result = await actions.rename(storeId, { name })
		if (!result.error) return { kind: 'done' }

		const existing = (result.details as { store_id?: unknown } | undefined)?.store_id
		if (result.errorCode === 'CONFLICT' && typeof existing === 'string' && existing !== storeId) {
			return { kind: 'conflict', storeId: existing }
		}
		if (result.errorCode === 'NOT_FOUND') return { kind: 'error', message: 'This store no longer exists. Refresh the page.' }
		return { kind: 'error', message: 'We couldn’t rename this store. Try again.' }
	} catch {
		return { kind: 'error', message: 'Check your connection and try again.' }
	}
}

/** Moves the source store's receipts and names into the target; the source store is removed. */
export async function mergeStoresAction(targetId: string, sourceId: string, actions: Actions = ACTIONS): Promise<MergeResult> {
	try {
		const result = await actions.merge(targetId, { source_store_id: sourceId })
		if (!result.error) return { kind: 'done' }
		if (result.errorCode === 'NOT_FOUND') return { kind: 'error', message: 'One of these stores no longer exists. Refresh the page.' }
		return { kind: 'error', message: 'We couldn’t merge these stores. Try again.' }
	} catch {
		return { kind: 'error', message: 'Check your connection and try again.' }
	}
}
