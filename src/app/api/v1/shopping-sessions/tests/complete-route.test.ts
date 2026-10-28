import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { POST } from '../[sessionId]/complete/route'
import { createAuthenticatedClient } from '@/lib/api/auth'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const SESSION_ID = '11111111-1111-4111-8111-111111111111'
const SUMMARY = { new_count: 2, updated_count: 3, skipped_count: 1, over_limit_count: 1 }

function mockRpc(result: { data?: unknown; error?: { message: string; code?: string } | null }) {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null, ...result })
  mockedAuth.mockResolvedValue({ supabase: { rpc }, user: { id: 'user-1' } } as never)
  return rpc
}

const complete = (body: unknown = {}) =>
  POST(
    new Request(`http://localhost/api/v1/shopping-sessions/${SESSION_ID}/complete`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ sessionId: SESSION_ID }) },
  )

describe('POST /api/v1/shopping-sessions/:sessionId/complete', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('completes through one RPC and returns the sync summary', async () => {
    const rpc = mockRpc({ data: [SUMMARY] })

    const response = await complete({ total_amount: 42.5, general_notes: 'Weekly' })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { success: true, sync: SUMMARY } })
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('complete_shopping_session', {
      p_session_id: SESSION_ID,
      p_total_amount: 42.5,
      p_general_notes: 'Weekly',
      p_max_items: MAX_ITEMS_PER_BASE_LIST,
    })
  })

  it.each([true, false])('still syncs when a legacy client sends sync_to_base: %s', async flag => {
    const rpc = mockRpc({ data: [SUMMARY] })

    const response = await complete({ sync_to_base: flag })

    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc.mock.calls[0][1]).not.toHaveProperty('sync_to_base')
  })

  it('returns 401 when the caller is not authenticated', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    const response = await complete()

    expect(response.status).toBe(401)
  })

  it('returns 422 without calling the database for an invalid body', async () => {
    const rpc = mockRpc({ data: [SUMMARY] })

    const response = await complete({ total_amount: -5 })

    expect(response.status).toBe(422)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('returns 404 for a session the caller does not own', async () => {
    mockRpc({ error: { message: 'SESSION_NOT_FOUND', code: 'P0001' } })

    const response = await complete()

    expect(response.status).toBe(404)
    expect((await response.json()).error.code).toBe(ErrorCode.NOT_FOUND)
  })

  it('returns 409 when the session is no longer active', async () => {
    mockRpc({ error: { message: 'SESSION_NOT_ACTIVE', code: 'P0001' } })

    const response = await complete()

    expect(response.status).toBe(409)
    expect((await response.json()).error.code).toBe(ErrorCode.CONFLICT)
  })

  it('hides database details when the RPC fails and logs only its code', async () => {
    mockRpc({ error: { message: 'duplicate key value violates unique constraint "secret_index"', code: '23505' } })

    const response = await complete()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.message).toBe('Could not complete the shopping session. Please try again.')
    expect(JSON.stringify(body)).not.toContain('secret_index')
    expect(consoleError).toHaveBeenCalledWith('[complete-session] completion failed', { code: '23505' })
  })

  it('reports zero counts when the RPC returns no row', async () => {
    mockRpc({ data: [] })

    const response = await complete()

    expect((await response.json()).data.sync).toEqual({
      new_count: 0,
      updated_count: 0,
      skipped_count: 0,
      over_limit_count: 0,
    })
  })
})

describe('PATCH /api/v1/shopping-sessions/:sessionId', () => {
  it('rejects status completed before touching the database', async () => {
    vi.resetModules()
    const update = vi.fn()
    vi.doMock('@/lib/server/services/shopping-sessions.service', () => ({ updateShoppingSession: update }))
    const { PATCH } = await import('../[sessionId]/route')

    const response = await PATCH(
      new Request(`http://localhost/api/v1/shopping-sessions/${SESSION_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      }),
      { params: Promise.resolve({ sessionId: SESSION_ID }) },
    )

    expect(response.status).toBe(422)
    expect((await response.json()).error.message).toContain('complete operation')
    expect(update).not.toHaveBeenCalled()
    vi.doUnmock('@/lib/server/services/shopping-sessions.service')
  })

  it('still saves a name change', async () => {
    vi.resetModules()
    const update = vi.fn().mockResolvedValue({ id: SESSION_ID, name: 'Trip' })
    vi.doMock('@/lib/server/services/shopping-sessions.service', () => ({ updateShoppingSession: update }))
    const { PATCH } = await import('../[sessionId]/route')

    const response = await PATCH(
      new Request(`http://localhost/api/v1/shopping-sessions/${SESSION_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Trip', sync_to_base: false }),
      }),
      { params: Promise.resolve({ sessionId: SESSION_ID }) },
    )

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(SESSION_ID, { name: 'Trip' })
    vi.doUnmock('@/lib/server/services/shopping-sessions.service')
  })
})
