import type { SessionItemDto } from '@/lib/validations/shopping-session-item'

export type CheckIntention = { itemId: string; checked: boolean; expectedVersion: number; sequence: number }
export type CheckConflict = { intention: CheckIntention; reason: 'changed' | 'unavailable' }
export type TripSyncState = {
  items: Record<string, SessionItemDto>
  pending: Record<string, CheckIntention>
  conflicts: Record<string, CheckConflict>
  sequence: number
  revision: number
  initialized: boolean
  busy: boolean
  locked: boolean
  ended: boolean
  error: string | null
  storageError: boolean
}

export function initialTripSyncState(): TripSyncState {
  return { items: {}, pending: {}, conflicts: {}, sequence: 0, revision: 0, initialized: false,
    busy: false, locked: false, ended: false, error: null, storageError: false }
}

export function visibleTripItems(state: TripSyncState): SessionItemDto[] {
  return Object.values(state.items).map(item => state.pending[item.id]
    ? { ...item, checked: state.pending[item.id].checked } : item)
}

/** A remote value never silently changes the base version of a local intention. */
export function reconcileIntention(state: TripSyncState, intention: CheckIntention) {
  const item = state.items[intention.itemId]
  if (!item || state.ended) {
    delete state.pending[intention.itemId]
    state.conflicts[intention.itemId] = { intention, reason: 'unavailable' }
  } else if (item.checked === intention.checked) {
    delete state.pending[item.id]
    delete state.conflicts[item.id]
  } else if (item.version !== intention.expectedVersion) {
    delete state.pending[item.id]
    state.conflicts[item.id] = { intention, reason: 'changed' }
  }
}

export function copyTripState(state: TripSyncState): TripSyncState {
  return { ...state, items: { ...state.items }, pending: { ...state.pending }, conflicts: { ...state.conflicts } }
}
