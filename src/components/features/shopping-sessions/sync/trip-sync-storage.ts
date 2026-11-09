import { z } from 'zod'
import type { CheckConflict, CheckIntention, TripSyncState } from './trip-sync-state'

const intentionSchema = z.object({ itemId: z.string().uuid(), checked: z.boolean(),
  expectedVersion: z.number().int().positive(), sequence: z.number().int().nonnegative() }).strict()
const envelopeSchema = z.object({ format: z.literal(1), pending: z.array(intentionSchema),
  conflicts: z.array(z.object({ intention: intentionSchema, reason: z.enum(['changed', 'unavailable']) }).strict()) }).strict()

export interface TripSyncStorage {
  load: () => { pending: CheckIntention[]; conflicts: CheckConflict[] }
  save: (state: TripSyncState) => void
}

export function tripSyncStorageKey(userId: string, tripId: string) {
  return `listys:trip-checks:v1:${userId}:${tripId}`
}

export function createTripSyncStorage(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, userId: string, tripId: string): TripSyncStorage {
  const key = tripSyncStorageKey(userId, tripId)
  return {
    load: () => {
      const raw = storage.getItem(key)
      if (raw === null) return { pending: [], conflicts: [] }
      return envelopeSchema.parse(JSON.parse(raw))
    },
    save: state => {
      const pending = Object.values(state.pending)
      const conflicts = Object.values(state.conflicts)
      if (!pending.length && !conflicts.length) storage.removeItem(key)
      else storage.setItem(key, JSON.stringify({ format: 1, pending, conflicts }))
    },
  }
}
