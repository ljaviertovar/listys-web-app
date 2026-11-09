'use client'

import { useTripSync } from '@/components/features/shopping-sessions/hooks/use-trip-sync'
import { visibleTripItems } from '@/components/features/shopping-sessions/sync/trip-sync-state'

export interface SessionProgress {
	checked: number
	total: number
}

/**
 * The bar shares the trip's optimistic items, including checks still being saved.
 * Keep refreshKey in the call signature for existing callers; reconnection is owned by the registry.
 */
export function useSessionProgress(sessionId: string | null, refreshKey: string): SessionProgress | null {
	void refreshKey
	const { state } = useTripSync(sessionId)
	if (!sessionId || !state.initialized) return null
	const items = visibleTripItems(state)
	return { checked: items.filter(item => item.checked === true).length, total: items.length }
}
