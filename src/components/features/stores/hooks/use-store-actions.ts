'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { Store } from '@/types'

import { mergeStoresAction, renameStoreAction } from '../helpers/store-actions'

/** Which sheet of the My Stores screen is open, and for which stores. */
type Flow =
	| { kind: 'idle' }
	| { kind: 'rename'; store: Store; error: string | null; conflictWith: Store | null }
	| { kind: 'pick-target'; source: Store }
	| { kind: 'confirm-merge'; source: Store; target: Store; error: string | null }

/**
 * Renaming and merging stores. A rename onto a name another store has turns into the merge confirmation, because that is
 * the user's way out; every success reads the page again so counts and receipt titles update, and the sheet stays busy
 * until that refresh has been drawn (the transition covers it), so the old name never shows with live buttons.
 */
export function useStoreActions(stores: Store[]) {
	const router = useRouter()
	const [flow, setFlow] = useState<Flow>({ kind: 'idle' })
	const [pending, startTransition] = useTransition()

	const close = () => {
		if (!pending) setFlow({ kind: 'idle' })
	}

	const rename = (name: string) => {
		if (flow.kind !== 'rename' || pending) return
		const current = flow

		startTransition(async () => {
			const result = await renameStoreAction(current.store.id, name)

			if (result.kind === 'done') {
				setFlow({ kind: 'idle' })
				toast.success('Store renamed')
				router.refresh()
			} else if (result.kind === 'conflict') {
				setFlow({
					...current,
					error: 'Another store already uses this name. Merge them instead?',
					conflictWith: stores.find(store => store.id === result.storeId) ?? null,
				})
			} else {
				setFlow({ ...current, error: result.message, conflictWith: null })
			}
		})
	}

	const merge = () => {
		if (flow.kind !== 'confirm-merge' || pending) return
		const current = flow

		startTransition(async () => {
			const result = await mergeStoresAction(current.target.id, current.source.id)

			if (result.kind === 'done') {
				setFlow({ kind: 'idle' })
				toast.success(`Stores merged into “${current.target.name}”`)
				router.refresh()
			} else {
				setFlow({ ...current, error: result.message })
			}
		})
	}

	return {
		flow,
		pending,
		close,
		startRename: (store: Store) => setFlow({ kind: 'rename', store, error: null, conflictWith: null }),
		startMerge: (source: Store) => setFlow({ kind: 'pick-target', source }),
		chooseTarget: (source: Store, target: Store) => setFlow({ kind: 'confirm-merge', source, target, error: null }),
		rename,
		merge,
	}
}
