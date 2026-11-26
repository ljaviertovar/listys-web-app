// Protects: ordering of the background check saves, so a trip never starts from checks the server does not have.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createNeededSyncController, NEEDED_AUTOSAVE, type NeededSyncTransport } from '../items/sync/needed-sync-controller'

describe('needed sync controller', () => {
	beforeEach(() => { vi.useFakeTimers() })
	afterEach(() => { vi.useRealTimers() })

	it('sends spaced taps as one request, and a tap made while it is on its way in the next one', async () => {
		let answer: (value: object) => void = () => {}
		const save = vi.fn<NeededSyncTransport['save']>(() => new Promise(resolve => { answer = resolve }))
		const controller = createNeededSyncController({ save, onRejected: vi.fn() })

		// Regression: taps just under a second apart, ticking and unticking, made one request each.
		controller.queue(['a'], true)
		await vi.advanceTimersByTimeAsync(900)
		controller.queue(['b'], false)
		await vi.advanceTimersByTimeAsync(900)
		controller.queue(['c'], true)
		await vi.advanceTimersByTimeAsync(NEEDED_AUTOSAVE.debounceMs)
		expect(save.mock.calls).toEqual([[{ changes: [{ item_id: 'a', needed: true }, { item_id: 'b', needed: false }, { item_id: 'c', needed: true }] }]])

		controller.queue(['a'], false)
		answer({})
		await vi.advanceTimersByTimeAsync(NEEDED_AUTOSAVE.debounceMs)

		expect(save).toHaveBeenLastCalledWith({ changes: [{ item_id: 'a', needed: false }] })
		expect(controller.store.getState().entries.a).toMatchObject({ needed: false, saved: false })
	})

	it('fails the flush while the save fails, keeps the check and retries it', async () => {
		const save = vi.fn<NeededSyncTransport['save']>().mockResolvedValueOnce({ error: 'offline' }).mockResolvedValue({})
		const controller = createNeededSyncController({ save, onRejected: vi.fn() })

		controller.queue(['a'], true)
		await expect(controller.flush()).rejects.toThrow('offline')
		expect(controller.store.getState().entries.a).toMatchObject({ needed: true, saved: false })

		await vi.advanceTimersByTimeAsync(1000)
		expect(controller.store.getState().entries.a.saved).toBe(true)
	})

	// Regression: a saved check that the page data did not show yet asked for a new read on every mount, without end.
	it('asks for one more read when the data disagrees with a saved check, and then takes the server value', async () => {
		const controller = createNeededSyncController({ save: vi.fn().mockResolvedValue({}), onRejected: vi.fn() })
		controller.queue(['a'], true)
		await controller.flush()
		const stale = [{ id: 'a', needed_at: null }]

		expect(controller.release(stale)).toBe(true)
		expect(controller.release(stale)).toBe(false)
		expect(controller.store.getState().entries.a).toMatchObject({ needed: true })

		expect(controller.release([{ id: 'a', needed_at: null }])).toBe(false)
		expect(controller.store.getState().entries).toEqual({})
	})

	it('drops a refused check without retrying it', async () => {
		const save = vi.fn<NeededSyncTransport['save']>().mockResolvedValue({ error: 'Not found', status: 404 })
		const onRejected = vi.fn()
		const controller = createNeededSyncController({ save, onRejected })

		controller.queue(['a'], true)
		await expect(controller.flush()).rejects.toThrow('Not found')
		await vi.advanceTimersByTimeAsync(NEEDED_AUTOSAVE.retryMaxMs)

		expect(save).toHaveBeenCalledTimes(1)
		expect(controller.store.getState().entries).toEqual({})
		expect(onRejected).toHaveBeenCalledWith('Not found')
	})
})
