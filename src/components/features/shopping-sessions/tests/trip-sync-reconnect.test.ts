import { describe, expect, it, vi } from 'vitest'
import { listenForTripReconnect } from '../sync/trip-sync-reconnect'

function setup(visibility: DocumentVisibilityState = 'visible') {
  const view = new EventTarget()
  const page = Object.assign(new EventTarget(), { visibilityState: visibility })
  const registry = { reconnect: vi.fn() }
  const stop = listenForTripReconnect(registry, view, page)
  return { view, page, registry, stop }
}

describe('trip reconnection triggers', () => {
  it.each([
    ['the device comes back online', (t: ReturnType<typeof setup>) => t.view.dispatchEvent(new Event('online'))],
    ['the window regains focus', (t: ReturnType<typeof setup>) => t.view.dispatchEvent(new Event('focus'))],
    ['the page becomes visible again', (t: ReturnType<typeof setup>) => t.page.dispatchEvent(new Event('visibilitychange'))],
  ])('reads the server state and drains the queue when %s', (_name, trigger) => {
    const test = setup()
    trigger(test)
    expect(test.registry.reconnect).toHaveBeenCalledOnce()
  })

  it('does nothing while the page is hidden and resumes when it is visible again', () => {
    const test = setup('hidden')
    test.page.dispatchEvent(new Event('visibilitychange'))
    test.view.dispatchEvent(new Event('focus'))
    expect(test.registry.reconnect).not.toHaveBeenCalled()
    test.page.visibilityState = 'visible'
    test.page.dispatchEvent(new Event('visibilitychange'))
    expect(test.registry.reconnect).toHaveBeenCalledOnce()
  })

  it('stops reacting after cleanup', () => {
    const test = setup()
    test.stop()
    test.view.dispatchEvent(new Event('online'))
    test.view.dispatchEvent(new Event('focus'))
    test.page.dispatchEvent(new Event('visibilitychange'))
    expect(test.registry.reconnect).not.toHaveBeenCalled()
  })
})
