import { toast } from 'sonner'

import { setBaseListItemsNeeded } from '@/lib/api/endpoints'
import { broadcastListActivity } from '@/utils'

import { createCoalescedRefresh } from './coalesced-refresh'
import { createNeededSyncController, type NeededSyncController } from './needed-sync-controller'

const controllers = new Map<string, NeededSyncController>()
const refreshers = new Map<string, ReturnType<typeof createCoalescedRefresh>>()

function create(baseListId: string) {
	return createNeededSyncController({
		save: async data => {
			const result = await setBaseListItemsNeeded(baseListId, data)
			if (!result.error) broadcastListActivity(`list_activity_${baseListId}`)
			return result
		},
		onRejected: message => toast.error('Could not save your checks', { description: message }),
	})
}

function flushAll() {
	for (const controller of controllers.values()) void controller.flush().catch(() => {})
}

/** One controller per list for as long as the tab lives. The server render gets a throwaway one. */
export function getNeededSync(baseListId: string): NeededSyncController {
	if (typeof window === 'undefined') return create(baseListId)
	let controller = controllers.get(baseListId)
	if (!controller) {
		if (!controllers.size) {
			// Send early when the connection returns or the person switches away from the tab.
			window.addEventListener('online', flushAll)
			document.addEventListener('visibilitychange', flushAll)
		}
		controller = create(baseListId)
		controllers.set(baseListId, controller)
	}
	return controller
}

/**
 * The one way a list screen reads itself again. It waits while checks are on their way, unless they are failing, so
 * other changes still reach the screen. This tab's own saves do not need it: the screen already shows them.
 */
export function requestListRefresh(baseListId: string, refresh: () => void) {
	let request = refreshers.get(baseListId)
	if (!request) {
		request = createCoalescedRefresh(() => {
			const state = getNeededSync(baseListId).store.getState()
			return !state.failing && Object.values(state.entries).some(entry => !entry.saved)
		})
		refreshers.set(baseListId, request)
	}
	request(refresh)
}

export function isOwnCheckEcho(baseListId: string, row: { id?: string; needed_at?: string | null }) {
	return getNeededSync(baseListId).isEcho(row)
}
