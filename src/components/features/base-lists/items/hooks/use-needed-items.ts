'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { setBaseListItemsNeeded } from '@/lib/api/endpoints'
import { broadcastListActivity } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { applyNeededOverrides, settleOverride, startOverrides, type NeededOverrides } from '../helpers/needed-overrides'

/**
 * The checks of a base list. A tap shows at once and is saved in the order made; once nothing is in flight the server
 * is the truth again, so a check changed on another device is not masked by an old local one.
 */
export function useNeededItems(baseListId: string, serverItems: BaseListItemWithStoreSummary[]) {
	const router = useRouter()
	const [overrides, setOverrides] = useState<NeededOverrides>({})
	const [seenItems, setSeenItems] = useState(serverItems)
	const [savingCount, setSavingCount] = useState(0)
	const queue = useRef<Promise<unknown>>(Promise.resolve())

	// New server data (adjusted while rendering): only the checks still being saved stay local.
	if (seenItems !== serverItems) {
		setSeenItems(serverItems)
		setOverrides(current => Object.fromEntries(Object.entries(current).filter(([, override]) => override.pending > 0)))
	}

	const items = applyNeededOverrides(serverItems, overrides)

	const setNeeded = (targets: BaseListItemWithStoreSummary[], needed: boolean) => {
		const ids = targets.filter(item => Boolean(item.needed_at) !== needed).map(item => item.id)
		if (ids.length === 0) return

		setOverrides(current => startOverrides(current, ids, needed))
		setSavingCount(count => count + 1)
		queue.current = queue.current.then(async () => {
			const { error } = await setBaseListItemsNeeded(baseListId, { needed, item_ids: ids })
			setOverrides(current => settleOverride(current, ids, Boolean(error)))
			setSavingCount(count => count - 1)
			if (error) toast.error('Could not save your checks', { description: error })
			else broadcastListActivity(`list_activity_${baseListId}`)
			router.refresh()
		})
	}

	return { items, setNeeded, isSaving: savingCount > 0 }
}
