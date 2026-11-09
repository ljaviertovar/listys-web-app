import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getShoppingSession, toggleShoppingSessionItem } from '@/lib/api/endpoints/shopping-sessions'
import { sessionItemDtoSchema } from '@/lib/validations/shopping-session-item'
import { createTripSyncController } from './trip-sync-controller'
import { createTripSyncStorage } from './trip-sync-storage'

const snapshotSchema = z.object({ status: z.enum(['active', 'completed']), items: z.array(sessionItemDtoSchema) })

export function createTripSyncRegistry(userId: string) {
  const entries = new Map<string, ReturnType<typeof createTripSyncController>>()
  const channels = new Map<string, () => void>()
  let stopped = false
  const get = (id: string) => {
    let entry = entries.get(id)
    if (!entry) {
      let unavailableNotified = false
      entry = createTripSyncController({
        online: () => typeof navigator === 'undefined' || navigator.onLine,
        save: intention => toggleShoppingSessionItem(intention.itemId, intention.checked, intention.expectedVersion),
        load: async () => {
          const response = await getShoppingSession(id)
          if (response.status === 404) {
            const state = entry?.store.getState()
            if (!unavailableNotified && state && (Object.keys(state.pending).length || Object.keys(state.conflicts).length)) {
              unavailableNotified = true
              toast.info('This trip is no longer available.', { description: 'Some changes on this device were not applied.' })
            }
            return { active: false, items: [] }
          }
          if (response.error) throw new Error(response.error)
          const result = snapshotSchema.parse(response.data)
          return { active: result.status === 'active', items: result.items }
        },
      })
      entries.set(id, entry)
    }
    return entry
  }

  function start(id: string) {
    if (stopped || channels.has(id)) return
    const entry = get(id)
    try { entry.hydrate(createTripSyncStorage(window.localStorage, userId, id)) }
    catch { entry.hydrate({ load: () => { throw new Error('Storage unavailable') }, save: () => {} }) }
    const supabase = createClient()
    const channel = supabase.channel(`trip-sync:${id}:${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_session_items', filter: `shopping_session_id=eq.${id}` }, event => {
        const result = sessionItemDtoSchema.safeParse(event.new)
        if (event.eventType === 'DELETE' || !result.success) void entry.refresh()
        else entry.receive([result.data])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_sessions', filter: `id=eq.${id}` }, () => { void entry.refresh() })
      .subscribe(status => { if (status === 'SUBSCRIBED') void entry.refresh() })
    channels.set(id, () => { void supabase.removeChannel(channel) })
    void entry.refresh()
  }

  return { get, start,
    reconnect: (authenticated = false) => { for (const entry of entries.values()) void entry.reconnect(authenticated).catch(() => {}) },
    dispose: () => {
      stopped = true
      for (const entry of entries.values()) entry.dispose()
      for (const close of channels.values()) close()
      channels.clear()
      entries.clear()
    },
  }
}

export type TripSyncRegistry = ReturnType<typeof createTripSyncRegistry>
