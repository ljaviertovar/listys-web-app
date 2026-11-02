/** A change this tab started comes back as a realtime event within a moment; this long after it, the event is taken as the person's own. */
const OWN_ACTIVITY_WINDOW_MS = 4000

let lastLocalMutationAt = 0

/** Called when this tab sends a change (any request that is not a read), before the server can echo it back as a realtime event. */
export function markLocalMutation(now: number = Date.now()): void {
	lastLocalMutationAt = now
}

/**
 * True when a realtime event is most likely the echo of this person's own edit, so it should refresh the page without a
 * "List updated" toast. A collaborator's edit inside the same few seconds is refreshed too, only without the notice.
 */
export function isOwnRecentActivity(now: number = Date.now()): boolean {
	return now - lastLocalMutationAt < OWN_ACTIVITY_WINDOW_MS
}
