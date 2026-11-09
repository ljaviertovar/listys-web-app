'use client'

import { useCallback, useContext, useEffect } from 'react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { TripSyncContext } from '../trip-sync-provider'
import { initialTripSyncState } from '../sync/trip-sync-state'

const EMPTY_STORE = createStore(initialTripSyncState)

export function useTripSync(sessionId?: string | null) {
  const registry = useContext(TripSyncContext)
  const controller = sessionId && registry ? registry.get(sessionId) : null
  const state = useStore(controller?.store ?? EMPTY_STORE)
  useEffect(() => { if (sessionId) registry?.start(sessionId) }, [registry, sessionId])
  const barrier = useCallback(async <T,>(action: () => Promise<T>) => {
    // A click can precede passive effects; recover the durable queue first.
    if (sessionId) registry?.start(sessionId)
    return controller ? controller.barrier(action) : action()
  }, [controller, registry, sessionId])
  return { controller, state, barrier }
}
