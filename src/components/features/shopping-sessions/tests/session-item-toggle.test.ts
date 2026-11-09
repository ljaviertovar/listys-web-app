import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTripSyncController, type TripSyncController, type TripSyncTransport } from '../sync/trip-sync-controller'
import { visibleTripItems } from '../sync/trip-sync-state'
import { createTripSyncStorage, tripSyncStorageKey } from '../sync/trip-sync-storage'
import type { SessionItemDto } from '@/lib/validations/shopping-session-item'

const item: SessionItemDto = { id: '00000000-0000-4000-8000-000000000001', shopping_session_id: '00000000-0000-4000-8000-000000000002',
  name: 'Milk', normalized_name: 'milk', quantity: 1, unit: null, checked: false, notes: null, category: null,
  sort_order: 0, price: null, is_other_store: false, created_at: null, updated_at: null, version: 5 }
const controllers: TripSyncController[] = []
const deferred = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done }); return { promise, resolve } }

function setup(implementation?: TripSyncTransport['save'], online = () => true) {
  const save = vi.fn<TripSyncTransport['save']>(implementation ?? (async () => ({ data: { ...item, checked: true, version: 6 } })))
  const load = vi.fn(async () => ({ items: [item], active: true }))
  const controller = createTripSyncController({ save, load, online })
  controllers.push(controller)
  controller.hydrate()
  controller.receive([item])
  return { controller, save, load }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => { controllers.splice(0).forEach(controller => controller.dispose()); vi.useRealTimers() })

describe('shared trip checks', () => {
  it('keeps first-change order when the first item is coalesced again', async () => {
    const other = { ...item, id: '00000000-0000-4000-8000-000000000003' }
    const { controller, save } = setup(async intention => ({ data: {
      ...(intention.itemId === item.id ? item : other), checked: intention.checked, version: 6,
    } }))
    controller.receive([other])
    controller.queue(item.id, true)
    controller.queue(other.id, true)
    controller.queue(item.id, true)
    await controller.flush()
    expect(save.mock.calls.map(([intention]) => intention.itemId)).toEqual([item.id, other.id])
  })

  it('resolves an existing conflict once a later remote value satisfies it', async () => {
    const { controller, save } = setup()
    controller.queue(item.id, true)
    controller.receive([{ ...item, version: 6 }])
    expect(controller.store.getState().conflicts[item.id]).toBeDefined()
    controller.receive([{ ...item, checked: true, version: 7 }])
    await controller.flush()
    expect(controller.store.getState().conflicts).toEqual({})
    expect(save).not.toHaveBeenCalled()
  })

  it('does not run the final action when the initial authorized read fails', async () => {
    const load = vi.fn().mockRejectedValue(new Error('Unavailable'))
    const controller = createTripSyncController({ save: vi.fn(), load })
    controllers.push(controller)
    controller.hydrate()
    const complete = vi.fn(async () => {})
    await expect(controller.barrier(complete)).rejects.toThrow('refresh')
    expect(complete).not.toHaveBeenCalled()
    expect(controller.store.getState().locked).toBe(false)
  })

  it('updates the view immediately and coalesces rapid changes after 700ms', async () => {
    const { controller, save } = setup()
    controller.queue(item.id, true)
    controller.queue(item.id, false)
    controller.queue(item.id, true)
    expect(visibleTripItems(controller.store.getState())[0].checked).toBe(true)
    await vi.advanceTimersByTimeAsync(699)
    expect(save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(save).toHaveBeenCalledOnce()
    expect(save.mock.calls[0][0]).toMatchObject({ checked: true, expectedVersion: 5 })
    expect(controller.store.getState().pending).toEqual({})
  })

  it('starts saving within two seconds of continuous changes', async () => {
    const { controller, save } = setup()
    controller.queue(item.id, true)
    for (let index = 0; index < 3; index++) {
      await vi.advanceTimersByTimeAsync(500)
      controller.queue(item.id, true)
    }
    await vi.advanceTimersByTimeAsync(500)
    expect(save).toHaveBeenCalledOnce()
  })

  it('keeps an uncheck made while the check is in flight and flushes it afterwards', async () => {
    const first = deferred<{ data: SessionItemDto }>()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce({ data: { ...item, checked: false, version: 7 } })
    const { controller } = setup(save)
    controller.queue(item.id, true)
    await vi.advanceTimersByTimeAsync(700)
    controller.queue(item.id, false)
    const flushed = controller.flush()
    first.resolve({ data: { ...item, checked: true, version: 6 } })
    await flushed
    expect(save).toHaveBeenCalledTimes(2)
    expect(save.mock.calls[1][0]).toMatchObject({ checked: false, expectedVersion: 6 })
    expect(visibleTripItems(controller.store.getState())[0].checked).toBe(false)
  })

  it('does not rebase a later local click over an external version newer than its response', async () => {
    const first = deferred<{ data: SessionItemDto }>()
    const { controller, save } = setup(vi.fn(() => first.promise))
    controller.queue(item.id, true)
    await vi.advanceTimersByTimeAsync(700)
    controller.queue(item.id, false)
    controller.receive([{ ...item, checked: true, version: 8 }])
    first.resolve({ data: { ...item, checked: true, version: 6 } })
    await vi.advanceTimersByTimeAsync(0)
    expect(controller.store.getState().items[item.id].version).toBe(8)
    expect(controller.store.getState().conflicts[item.id].intention.checked).toBe(false)
    await vi.advanceTimersByTimeAsync(3000)
    expect(save).toHaveBeenCalledOnce()
  })

  it('keeps failed checks and retries only transient failures', async () => {
    const save = vi.fn().mockResolvedValueOnce({ error: 'Temporarily unavailable', status: 503 })
      .mockResolvedValueOnce({ data: { ...item, checked: true, version: 6 } })
    const { controller } = setup(save)
    controller.queue(item.id, true)
    await expect(controller.flush()).rejects.toThrow()
    expect(visibleTripItems(controller.store.getState())[0].checked).toBe(true)
    await vi.advanceTimersByTimeAsync(1201)
    expect(save).toHaveBeenCalledTimes(2)
    expect(controller.store.getState().pending).toEqual({})
  })

  it.each([401, 404, 409, 410, 422])('stops automatic retry for status %s', async status => {
    const { controller, save } = setup(vi.fn().mockResolvedValue({ error: 'Action required', status }))
    controller.queue(item.id, true)
    await expect(controller.flush()).rejects.toThrow()
    await vi.advanceTimersByTimeAsync(60000)
    await controller.reconnect()
    expect(save).toHaveBeenCalledOnce()
  })

  it('resumes an authentication failure only after authentication is restored', async () => {
    const { controller, save } = setup(vi.fn()
      .mockResolvedValueOnce({ error: 'Sign in again', status: 401 })
      .mockResolvedValueOnce({ data: { ...item, checked: true, version: 6 } }))
    controller.queue(item.id, true)
    await expect(controller.flush()).rejects.toThrow()
    await controller.reconnect()
    expect(save).toHaveBeenCalledOnce()
    await controller.reconnect(true)
    expect(save).toHaveBeenCalledTimes(2)
  })

  it.each([410, 422])('does not resume status %s on token refresh', async status => {
    const { controller, save } = setup(vi.fn().mockResolvedValue({ error: 'Action required', status }))
    controller.queue(item.id, true)
    await expect(controller.flush()).rejects.toThrow()
    await controller.reconnect(true)
    expect(save).toHaveBeenCalledOnce()
  })

  it('recovers a change missed while offline by reading the server on reconnect', async () => {
    const { controller, save, load } = setup()
    load.mockResolvedValue({ items: [{ ...item, checked: true, version: 6 }], active: true })
    await controller.reconnect()
    expect(load).toHaveBeenCalled()
    expect(visibleTripItems(controller.store.getState())[0]).toMatchObject({ checked: true, version: 6 })
    expect(save).not.toHaveBeenCalled()
  })

  it('does not send offline and retries when explicitly reconnected', async () => {
    let online = false
    const { controller, save } = setup(undefined, () => online)
    controller.queue(item.id, true)
    await vi.advanceTimersByTimeAsync(3000)
    expect(save).not.toHaveBeenCalled()
    online = true
    await controller.retry()
    expect(save).toHaveBeenCalledOnce()
  })

  it('bounds jittered exponential retries at thirty seconds', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(1)
    try {
      const { controller, save } = setup(vi.fn().mockResolvedValue({ error: 'Unavailable', status: 503 }))
      controller.queue(item.id, true)
      await expect(controller.flush()).rejects.toThrow()
      let attempts = 1
      for (const delay of [1200, 2400, 4800, 9600, 19200, 30000, 30000]) {
        await vi.advanceTimersByTimeAsync(delay - 1)
        expect(save).toHaveBeenCalledTimes(attempts)
        await vi.advanceTimersByTimeAsync(1)
        expect(save).toHaveBeenCalledTimes(++attempts)
      }
    } finally { random.mockRestore() }
  })

  it('resolves a lost response when the conflict already has the intended value', async () => {
    const { controller, save } = setup(vi.fn().mockResolvedValue({ error: 'Conflict', status: 409, errorCode: 'ITEM_VERSION_CONFLICT',
      details: { current_item: { ...item, checked: true, version: 6 } } }))
    controller.queue(item.id, true)
    await controller.flush()
    expect(controller.store.getState().pending).toEqual({})
    expect(controller.store.getState().conflicts).toEqual({})
    expect(save).toHaveBeenCalledOnce()
  })

  it('requires explicit reapply for a conflicting remote change', async () => {
    const { controller, save } = setup()
    controller.queue(item.id, true)
    controller.receive([{ ...item, checked: false, version: 7 }])
    await expect(controller.flush()).rejects.toThrow('Resolve')
    expect(visibleTripItems(controller.store.getState())[0].checked).toBe(false)
    expect(save).not.toHaveBeenCalled()
    controller.resolve(item.id, true)
    await controller.flush()
    expect(save.mock.calls[0][0]).toMatchObject({ expectedVersion: 7 })
  })

  it('resolves an existing conflict when a later external value satisfies it', () => {
    const { controller } = setup()
    controller.queue(item.id, true)
    controller.receive([{ ...item, checked: false, version: 7 }])
    expect(controller.store.getState().conflicts[item.id]).toBeDefined()
    controller.receive([{ ...item, checked: true, version: 8 }])
    expect(controller.store.getState().conflicts).toEqual({})
  })

  it('continues saving other items after an unavailable item is explicitly discarded', async () => {
    const other = { ...item, id: '00000000-0000-4000-8000-000000000003' }
    const save = vi.fn().mockResolvedValueOnce({ error: 'Not found', status: 404 })
      .mockResolvedValueOnce({ data: { ...other, checked: true, version: 6 } })
    const { controller } = setup(save)
    controller.receive([other])
    controller.queue(item.id, true)
    await expect(controller.flush()).rejects.toThrow()
    controller.resolve(item.id, false)
    controller.queue(other.id, true)
    await vi.advanceTimersByTimeAsync(700)
    expect(save).toHaveBeenCalledTimes(2)
    expect(controller.store.getState().pending).toEqual({})
  })

  it('blocks completion until the in-flight request finishes and freezes new edits', async () => {
    const first = deferred<{ data: SessionItemDto }>()
    const { controller } = setup(vi.fn(() => first.promise))
    const complete = vi.fn(async () => {})
    controller.queue(item.id, true)
    const barrier = controller.barrier(complete)
    await vi.advanceTimersByTimeAsync(0)
    controller.queue(item.id, false)
    expect(complete).not.toHaveBeenCalled()
    first.resolve({ data: { ...item, checked: true, version: 6 } })
    await barrier
    expect(complete).toHaveBeenCalledOnce()
    expect(controller.store.getState().locked).toBe(false)
  })

  it('does not execute the final action when flushing fails', async () => {
    const { controller } = setup(vi.fn().mockResolvedValue({ error: 'Offline', status: 503 }))
    const complete = vi.fn(async () => {})
    controller.queue(item.id, true)
    await expect(controller.barrier(complete)).rejects.toThrow('Offline')
    expect(complete).not.toHaveBeenCalled()
    expect(controller.store.getState().pending[item.id]).toBeDefined()
    expect(controller.store.getState().locked).toBe(false)
  })

  it('serializes different items without blocking their local changes', async () => {
    const first = deferred<{ data: SessionItemDto }>()
    const other = { ...item, id: '00000000-0000-4000-8000-000000000003' }
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce({ data: { ...other, checked: true, version: 6 } })
    const { controller } = setup(save)
    controller.receive([other])
    controller.queue(item.id, true)
    controller.queue(other.id, true)
    await vi.advanceTimersByTimeAsync(700)
    expect(visibleTripItems(controller.store.getState()).every(candidate => candidate.checked)).toBe(true)
    expect(save).toHaveBeenCalledOnce()
    const flushing = controller.flush()
    first.resolve({ data: { ...item, checked: true, version: 6 } })
    await flushing
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('clears account memory and ignores a response arriving after disposal', async () => {
    const result = deferred<{ data: SessionItemDto }>()
    const { controller } = setup(vi.fn(() => result.promise))
    controller.queue(item.id, true)
    await vi.advanceTimersByTimeAsync(700)
    controller.dispose()
    result.resolve({ data: { ...item, checked: true, version: 6 } })
    await vi.advanceTimersByTimeAsync(0)
    expect(controller.store.getState().items).toEqual({})
    expect(controller.store.getState().pending).toEqual({})
  })

  it('stops after external completion without silently dropping intentions', async () => {
    const { controller, save } = setup()
    controller.queue(item.id, true)
    controller.receive([], false)
    await vi.advanceTimersByTimeAsync(3000)
    expect(save).not.toHaveBeenCalled()
    expect(controller.store.getState().conflicts[item.id].reason).toBe('unavailable')
    await expect(controller.flush()).rejects.toThrow('ended')
  })

  it('never removes or downgrades an event received during a stale full read', async () => {
    const loaded = deferred<{ items: SessionItemDto[]; active: boolean }>()
    const load = vi.fn().mockReturnValueOnce(loaded.promise).mockResolvedValue({ items: [{ ...item, version: 8 }], active: true })
    const controller = createTripSyncController({ save: vi.fn(), load })
    controllers.push(controller)
    controller.hydrate()
    const refreshing = controller.refresh()
    controller.receive([{ ...item, version: 8 }])
    loaded.resolve({ items: [], active: true })
    await refreshing
    expect(controller.store.getState().items[item.id].version).toBe(8)
  })
})

describe('durable outbox', () => {
  function memoryStorage() {
    const values = new Map<string, string>()
    return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) }, values }
  }

  it('recovers the sent intention after a lost response without writing it twice', async () => {
    const memory = memoryStorage()
    const durable = createTripSyncStorage(memory, 'owner', item.shopping_session_id)
    const sent = deferred<{ data: SessionItemDto }>()
    const first = createTripSyncController({ save: () => sent.promise, load: vi.fn() })
    controllers.push(first)
    first.hydrate(durable)
    first.receive([item])
    first.queue(item.id, true)
    await vi.advanceTimersByTimeAsync(700)
    expect(first.store.getState().busy).toBe(true)
    expect(durable.load().pending[0]).toMatchObject({ checked: true, expectedVersion: 5 })
    first.dispose()
    const save = vi.fn()
    const recovered = createTripSyncController({ save, load: vi.fn() })
    controllers.push(recovered)
    recovered.hydrate(durable)
    recovered.receive([{ ...item, checked: true, version: 6 }])
    await recovered.flush()
    expect(save).not.toHaveBeenCalled()
    expect(durable.load().pending).toEqual([])
    sent.resolve({ data: { ...item, checked: true, version: 6 } })
    await vi.advanceTimersByTimeAsync(0)
  })

  it('keeps a recovered conflict separate and does not overwrite storage before hydration', () => {
    const memory = memoryStorage()
    const durable = createTripSyncStorage(memory, 'owner', item.shopping_session_id)
    const { controller: first } = setup()
    first.hydrate(durable)
    first.queue(item.id, true)
    first.receive([{ ...item, version: 6 }])
    durable.save(first.store.getState())
    const raw = memory.getItem(tripSyncStorageKey('owner', item.shopping_session_id))
    const recovered = createTripSyncController({ save: vi.fn(), load: vi.fn() })
    controllers.push(recovered)
    recovered.receive([{ ...item, version: 6 }])
    expect(memory.getItem(tripSyncStorageKey('owner', item.shopping_session_id))).toBe(raw)
    recovered.hydrate(durable)
    expect(recovered.store.getState().pending).toEqual({})
    expect(recovered.store.getState().conflicts[item.id].intention).toMatchObject({ checked: true, expectedVersion: 5 })
    expect(createTripSyncStorage(memory, 'owner', 'another-trip').load().conflicts).toEqual([])
  })

  it('recovers pending checks with original versions without persisting item content', () => {
    const memory = memoryStorage()
    const durable = createTripSyncStorage(memory, 'owner', item.shopping_session_id)
    const first = createTripSyncController({ save: vi.fn(), load: vi.fn(), online: () => false })
    controllers.push(first)
    first.hydrate(durable)
    first.receive([item])
    first.queue(item.id, true)
    const raw = [...memory.values.values()][0]
    expect(raw).not.toContain('Milk')
    expect(raw).not.toContain('price')
    const second = createTripSyncController({ save: vi.fn(), load: vi.fn(), online: () => false })
    controllers.push(second)
    second.hydrate(durable)
    second.receive([item])
    expect(second.store.getState().pending[item.id]).toMatchObject({ checked: true, expectedVersion: 5 })
    expect(createTripSyncStorage(memory, 'another-owner', item.shopping_session_id).load().pending).toEqual([])
  })

  it('reports invalid storage and remains usable in memory', () => {
    const memory = memoryStorage()
    memory.setItem(tripSyncStorageKey('owner', item.shopping_session_id), '{bad')
    const controller = createTripSyncController({ save: vi.fn(), load: vi.fn(), online: () => false })
    controllers.push(controller)
    controller.hydrate(createTripSyncStorage(memory, 'owner', item.shopping_session_id))
    controller.receive([item])
    controller.queue(item.id, true)
    expect(controller.store.getState().storageError).toBe(true)
    expect(visibleTripItems(controller.store.getState())[0].checked).toBe(true)
  })

  it('reports rejected storage writes while keeping the check in memory', () => {
    const memory = memoryStorage()
    const controller = createTripSyncController({ save: vi.fn(), load: vi.fn(), online: () => false })
    controllers.push(controller)
    controller.hydrate(createTripSyncStorage({ ...memory, setItem: () => { throw new Error('Quota exceeded') } }, 'owner', item.shopping_session_id))
    controller.receive([item])
    controller.queue(item.id, true)
    expect(controller.store.getState().storageError).toBe(true)
    expect(controller.store.getState().pending[item.id].checked).toBe(true)
  })
})
