'use client'

import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTripSyncRegistry, type TripSyncRegistry } from './sync/trip-sync-registry'
import { listenForTripReconnect } from './sync/trip-sync-reconnect'

export const TripSyncContext = createContext<TripSyncRegistry | null>(null)

/** Request-scoped on SSR and account-scoped in the browser; no artificial DOM. */
export function TripSyncProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [registry] = useState(() => createTripSyncRegistry(userId))
  const disposal = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    clearTimeout(disposal.current)
    const stopListening = listenForTripReconnect(registry, window, document)
    const { data } = createClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (session && session.user.id !== userId)) registry.dispose()
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') registry.reconnect(true)
    })
    return () => {
      stopListening()
      data.subscription.unsubscribe()
      // StrictMode immediately reconnects effects; a real unmount disposes the account.
      disposal.current = setTimeout(() => registry.dispose(), 0)
    }
  }, [registry, userId])
  return <TripSyncContext.Provider value={registry}>{children}</TripSyncContext.Provider>
}
