import { createStore } from 'zustand/vanilla'
import { sessionItemDtoSchema, type SessionItemDto } from '@/lib/validations/shopping-session-item'
import { copyTripState, initialTripSyncState, reconcileIntention, type CheckIntention, type TripSyncState } from './trip-sync-state'
import type { TripSyncStorage } from './trip-sync-storage'

export const TRIP_AUTOSAVE = { debounceMs: 700, maxWaitMs: 2000, retryMaxMs: 30_000 } as const
const SAVE_ERROR = 'Your changes are not saved yet. Try again.'
const CONFLICT_ERROR = 'Resolve the item changes before continuing.'
type SaveResult = { data?: unknown; error?: string; errorCode?: string; details?: unknown; status?: number }
export type TripSyncTransport = {
  save: (intention: CheckIntention) => Promise<SaveResult>
  load: () => Promise<{ items: SessionItemDto[]; active: boolean }>
  online?: () => boolean
}

/** One controller outlives rows and route navigation; no request is owned by a checkbox. */
export function createTripSyncController(transport: TripSyncTransport) {
  const store = createStore<TripSyncState>(() => initialTripSyncState())
  let storage: TripSyncStorage | undefined
  let disposed = false
  let hydrated = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let firstChangeAt: number | undefined
  let failures = 0
  let retryAt = 0
  let terminal = false
  let terminalStatus: number | undefined
  let inFlight: { intention: CheckIntention; promise: Promise<void> } | undefined
  let loading: Promise<void> | undefined

  function update(change: (state: TripSyncState) => void, persist = true) {
    if (disposed) return
    const state = copyTripState(store.getState())
    change(state)
    state.revision++
    if (persist && hydrated && storage) {
      try { storage.save(state) } catch { state.storageError = true }
    }
    store.setState(state)
  }

  function stopTimer() { clearTimeout(timer); timer = undefined }
  function schedule() {
    stopTimer()
    const state = store.getState()
    if (disposed || terminal || !hydrated || !state.initialized || state.ended || inFlight || !Object.keys(state.pending).length) return
    if (transport.online?.() === false) { update(s => { s.error = SAVE_ERROR }, false); return }
    const now = Date.now()
    firstChangeAt ??= now
    const wait = retryAt > now ? retryAt - now : Math.max(0, Math.min(TRIP_AUTOSAVE.debounceMs, firstChangeAt + TRIP_AUTOSAVE.maxWaitMs - now))
    timer = setTimeout(() => { void sendOne().catch(() => {}) }, wait)
  }

  function reconcileRemote(items: SessionItemDto[], active: boolean, removeMissing = false) {
    update(state => {
      if (removeMissing) {
        const ids = new Set(items.map(item => item.id))
        for (const id of Object.keys(state.items)) if (!ids.has(id)) delete state.items[id]
      }
      for (const item of items) {
        if (!state.items[item.id] || state.items[item.id].version <= item.version) state.items[item.id] = item
      }
      state.initialized = true
      state.ended = state.ended || !active
      for (const intention of Object.values(state.pending)) {
        if (state.ended || inFlight?.intention.itemId !== intention.itemId) reconcileIntention(state, intention)
      }
      if (state.error === 'Could not refresh this trip. Try again.') state.error = null
      for (const { intention } of Object.values(state.conflicts)) {
        const item = state.items[intention.itemId]
        if (state.ended || (removeMissing && !item)) {
          state.conflicts[intention.itemId] = { intention, reason: 'unavailable' }
        } else if (item?.checked === intention.checked) {
          delete state.conflicts[intention.itemId]
        }
      }
      if (!Object.keys(state.pending).length && !Object.keys(state.conflicts).length) state.error = null
    })
    if (!active) stopTimer()
    else schedule()
  }

  function hydrate(nextStorage?: TripSyncStorage) {
    if (hydrated || disposed) return
    storage = nextStorage
    try {
      const recovered = storage?.load()
      if (recovered) update(state => {
        for (const intention of recovered.pending) {
          state.pending[intention.itemId] = intention
          state.sequence = Math.max(state.sequence, intention.sequence)
        }
        for (const conflict of recovered.conflicts) {
          state.conflicts[conflict.intention.itemId] = conflict
          state.sequence = Math.max(state.sequence, conflict.intention.sequence)
        }
      }, false)
    } catch { update(state => { state.storageError = true }, false) }
    hydrated = true
    if (store.getState().initialized) reconcileRemote([], !store.getState().ended)
  }

  function queue(itemId: string, checked: boolean) {
    const state = store.getState()
    const item = state.items[itemId]
    if (!item || state.locked || state.ended || disposed) return
    update(next => {
      next.sequence++
      const previous = next.pending[itemId]
      delete next.conflicts[itemId]
      next.pending[itemId] = { itemId, checked, expectedVersion: previous?.expectedVersion ?? item.version, sequence: next.sequence }
      if (inFlight?.intention.itemId !== itemId) reconcileIntention(next, next.pending[itemId])
    })
    firstChangeAt ??= Date.now()
    schedule()
  }

  async function sendOne() {
    if (inFlight) return inFlight.promise
    stopTimer()
    const state = store.getState()
    if (disposed || state.ended) throw new Error('This trip is no longer active.')
    if (terminal || transport.online?.() === false) throw new Error(state.error ?? SAVE_ERROR)
    // Replacing an intention preserves its insertion order; later taps must not
    // move the first changed item behind newer items in the outbox.
    const intention = Object.values(state.pending)[0]
    if (!intention) return
    const sent = { ...intention }
    update(next => { next.busy = true; next.error = null })
    const promise = Promise.resolve().then(async () => {
      try {
        const result = await transport.save(sent)
        if (disposed) return
        const itemResult = sessionItemDtoSchema.safeParse(result.data)
        const details = result.details && typeof result.details === 'object' && 'current_item' in result.details ? result.details.current_item : null
        const conflictItem = sessionItemDtoSchema.safeParse(details)
        if (result.errorCode === 'ITEM_VERSION_CONFLICT' && conflictItem.success) {
          update(next => {
            const item = conflictItem.data
            if (!next.items[item.id] || next.items[item.id].version <= item.version) next.items[item.id] = item
            const current = next.pending[sent.itemId]
            if (current) reconcileIntention(next, current)
          })
        } else if (result.error || !itemResult.success) {
          terminal = result.status !== undefined && result.status < 500
          terminalStatus = terminal ? result.status : undefined
          update(next => {
            next.error = result.error ?? SAVE_ERROR
            if (result.errorCode === 'SESSION_NOT_ACTIVE') {
              next.ended = true
              for (const pending of Object.values(next.pending)) reconcileIntention(next, pending)
            } else if (result.status === 404) {
              const current = next.pending[sent.itemId]
              if (current) {
                delete next.pending[sent.itemId]
                next.conflicts[sent.itemId] = { intention: current, reason: 'unavailable' }
              }
            }
          })
          throw new Error(result.error ?? SAVE_ERROR)
        } else {
          update(next => {
            const item = itemResult.data
            if (!next.items[item.id] || next.items[item.id].version <= item.version) next.items[item.id] = item
            const current = next.pending[sent.itemId]
            if (current?.sequence === sent.sequence) delete next.pending[sent.itemId]
            else if (current) {
              if (next.items[item.id].version === item.version) next.pending[item.id] = { ...current, expectedVersion: item.version }
              reconcileIntention(next, next.pending[item.id])
            }
          })
        }
        failures = 0; retryAt = 0
      } catch (error) {
        if (disposed) return
        update(next => { next.error ??= SAVE_ERROR })
        if (!terminal) {
          const base = Math.min(1000 * 2 ** Math.min(failures++, 5), TRIP_AUTOSAVE.retryMaxMs)
          retryAt = Date.now() + Math.min(TRIP_AUTOSAVE.retryMaxMs, Math.round(base * (0.8 + Math.random() * 0.4)))
        }
        throw error
      } finally {
        inFlight = undefined
        firstChangeAt = undefined
        update(next => { next.busy = false })
        schedule()
      }
    })
    inFlight = { intention: sent, promise }
    return promise
  }

  async function flush() {
    if (disposed) throw new Error('Sign in again before continuing.')
    stopTimer()
    if (loading) await loading
    if (!store.getState().initialized) {
      await refresh()
      if (!store.getState().initialized) throw new Error(store.getState().error ?? SAVE_ERROR)
    }
    if (inFlight) await inFlight.promise
    if (disposed) throw new Error('Sign in again before continuing.')
    if (store.getState().ended && Object.keys(store.getState().conflicts).length) throw new Error('This trip has ended. Pending changes were not applied.')
    if (Object.keys(store.getState().conflicts).length) throw new Error(CONFLICT_ERROR)
    while (Object.keys(store.getState().pending).length) {
      retryAt = 0
      await sendOne()
      if (Object.keys(store.getState().conflicts).length) throw new Error(CONFLICT_ERROR)
    }
  }

  async function refresh() {
    if (disposed) return
    if (loading) return loading
    const revision = store.getState().revision
    let stale = false
    loading = transport.load().then(result => {
      if (disposed) return
      stale = revision !== store.getState().revision
      // A stale full read must not remove an item/event received while it loaded.
      reconcileRemote(result.items, result.active, revision === store.getState().revision)
    }).catch(() => { update(next => { next.error = 'Could not refresh this trip. Try again.' }, false) })
      .finally(() => {
        loading = undefined
        if (stale && !disposed) void refresh()
      })
    return loading
  }

  return {
    store, hydrate, queue, flush, refresh,
    receive: (items: SessionItemDto[], active = !store.getState().ended) => reconcileRemote(items, active),
    reconnect: async (authenticated = false) => {
      if (authenticated && terminalStatus === 401) { terminal = false; terminalStatus = undefined }
      retryAt = 0
      await refresh()
      if (!terminal) await flush()
    },
    retry: async () => { terminal = false; terminalStatus = undefined; retryAt = 0; await refresh(); return flush() },
    resolve: (itemId: string, reapply: boolean) => {
      const conflict = store.getState().conflicts[itemId]
      if (!conflict) return
      update(next => {
        delete next.conflicts[itemId]
        if (!Object.keys(next.pending).length && !Object.keys(next.conflicts).length) next.error = null
      })
      if (reapply && conflict.reason === 'changed') queue(itemId, conflict.intention.checked)
      if (terminalStatus === 404 && !store.getState().ended) {
        terminal = false; terminalStatus = undefined
        schedule()
      }
    },
    async barrier<T>(action: () => Promise<T>) {
      if (store.getState().locked) throw new Error('Please wait for the current action.')
      update(next => { next.locked = true }, false)
      try { await flush(); return await action() }
      finally { update(next => { next.locked = false }, false) }
    },
    dispose: () => { stopTimer(); disposed = true; store.setState(initialTripSyncState()) },
  }
}

export type TripSyncController = ReturnType<typeof createTripSyncController>
