import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiPatch } from '../client'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'localhost:3000' }),
  cookies: async () => ({ toString: () => '' }),
}))

afterEach(() => vi.unstubAllGlobals())

describe('HTTP result classification', () => {
  it.each([401, 404, 410, 422, 503])('preserves status %s for non-JSON failures', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status })))
    expect((await apiPatch('/api/v2/shopping-session-items/item', {})).status).toBe(status)
  })

  it('preserves JSON success data and metadata alongside the HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ data: { version: 2 }, meta: { request_id: 'request' } })))
    expect(await apiPatch('/api/v2/shopping-session-items/item', {})).toEqual({
      data: { version: 2 }, meta: { request_id: 'request' }, status: 200,
    })
  })

  it('keeps a network error distinct from an HTTP rejection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')))
    const result = await apiPatch('/api/v2/shopping-session-items/item', {})
    expect(result.error).toBe('Network unavailable')
    expect(result.status).toBeUndefined()
  })
})
