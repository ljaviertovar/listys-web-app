import type { TripSyncRegistry } from './trip-sync-registry'

type Events = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

/**
 * A device can miss events while it is offline, in the background or asleep. Coming back online, regaining focus or becoming
 * visible again asks every open trip to read the server state and drain its queue. A hidden page does not, so an inactive tab
 * never sends. `page.visibilityState` is read when the event fires, not when listening starts.
 */
export function listenForTripReconnect(
  registry: Pick<TripSyncRegistry, 'reconnect'>,
  view: Events,
  page: Events & { visibilityState: DocumentVisibilityState },
) {
  const reconnect = () => { if (page.visibilityState !== 'hidden') registry.reconnect() }
  view.addEventListener('online', reconnect)
  view.addEventListener('focus', reconnect)
  page.addEventListener('visibilitychange', reconnect)
  return () => {
    view.removeEventListener('online', reconnect)
    view.removeEventListener('focus', reconnect)
    page.removeEventListener('visibilitychange', reconnect)
  }
}
