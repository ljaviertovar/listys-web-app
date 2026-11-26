'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'zustand'

import type { BaseListItemWithStoreSummary } from '@/types'

import { applyNeededEntries } from '../sync/needed-sync-controller'
import { getNeededSync, requestListRefresh } from '../sync/needed-sync-registry'

/**
 * The checks of a base list. A tap shows at once and is saved in the background without reading the page again; when
 * page data does arrive it is the truth, so a check changed on another device is not masked by an old local one.
 */
export function useNeededItems(baseListId: string, serverItems: BaseListItemWithStoreSummary[]) {
	const router = useRouter()
	const [controller] = useState(() => getNeededSync(baseListId))
	const entries = useStore(controller.store, state => state.entries)
	const saveFailed = useStore(controller.store, state => state.failing)
	const isSaving = useStore(controller.store, state => Object.values(state.entries).some(entry => !entry.saved))

	useEffect(() => {
		if (controller.release(serverItems)) requestListRefresh(baseListId, () => router.refresh())
	}, [baseListId, controller, router, serverItems])

	useEffect(
		() => controller.store.subscribe((state, previous) => {
			if (state.rejectedCount !== previous.rejectedCount) requestListRefresh(baseListId, () => router.refresh())
		}),
		[baseListId, controller, router],
	)

	const items = applyNeededEntries(serverItems, entries)

	const setNeeded = (targets: BaseListItemWithStoreSummary[], needed: boolean) => {
		const ids = targets.filter(item => Boolean(item.needed_at) !== needed).map(item => item.id)
		if (ids.length > 0) controller.queue(ids, needed)
	}

	const retry = () => { void controller.flush().catch(() => {}) }

	return { items, setNeeded, isSaving, saveFailed, retry }
}
