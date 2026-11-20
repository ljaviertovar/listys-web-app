import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const harness = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  setStatus: vi.fn(),
  removeChannel: vi.fn(),
  subscribe: vi.fn(),
}))

// Execute the app-owned subscription/poll lifecycle without a DOM or testing React internals.
vi.mock('react', () => ({
  useState: (initial: string) => [initial, harness.setStatus],
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => void | (() => void)) => { harness.effects.push(effect) },
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => ({ on: () => ({ subscribe: harness.subscribe }) }),
    removeChannel: harness.removeChannel,
  }),
}))

import { useTicketStatus } from '../hooks/use-ticket-status'

let cleanup: void | (() => void)
beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  harness.effects = []
})
afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('receipt status polling', () => {
  it('uses the versioned status envelope and refreshes once on failure', async () => {
    const onTerminal = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { ocr_status: 'failed' } })))
    vi.stubGlobal('fetch', fetchMock)
    useTicketStatus({ ticketId: 'receipt-1', initialStatus: 'processing', onTerminal })
    cleanup = harness.effects[1]()
    await vi.advanceTimersByTimeAsync(9_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/tickets/receipt-1/status', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(harness.setStatus).toHaveBeenCalledWith('failed')
    expect(onTerminal).toHaveBeenCalledExactlyOnceWith('failed')
  })

  it('cancels a hung poll, prevents overlapping requests and can recover on the next poll', async () => {
    let signal: AbortSignal | undefined
    const fetchMock = vi.fn()
      .mockImplementationOnce((_url: string, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
        signal = init.signal as AbortSignal
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }))
      .mockResolvedValue(new Response(JSON.stringify({ data: { ocr_status: 'failed' } })))
    vi.stubGlobal('fetch', fetchMock)
    const onTerminal = vi.fn()
    useTicketStatus({ ticketId: 'receipt-1', initialStatus: 'processing', onTerminal })
    cleanup = harness.effects[1]()
    await vi.advanceTimersByTimeAsync(12_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(signal?.aborted).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(onTerminal).toHaveBeenCalledExactlyOnceWith('failed')
  })

  it('does not subscribe or poll a terminal receipt', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    useTicketStatus({ ticketId: 'receipt-1', initialStatus: 'failed' })
    cleanup = harness.effects[1]()
    await vi.advanceTimersByTimeAsync(30_000)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(harness.subscribe).not.toHaveBeenCalled()
  })
})
