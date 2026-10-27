import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/shopping-sessions.service', () => ({
  createShoppingSession: vi.fn(),
  getActiveShoppingSession: vi.fn(),
  getShoppingHistory: vi.fn(),
}))

import { GET } from '../route'
import { POST } from '../route'
import { createShoppingSession, getActiveShoppingSession, getShoppingHistory } from '@/lib/server/services/shopping-sessions.service'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

const mockedCreateShoppingSession = vi.mocked(createShoppingSession)
const mockedGetActiveShoppingSession = vi.mocked(getActiveShoppingSession)
const mockedGetShoppingHistory = vi.mocked(getShoppingHistory)

describe('GET /api/v1/shopping-sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns active session when status=active', async () => {
    mockedGetActiveShoppingSession.mockResolvedValueOnce({ id: 'session-active' } as never)

    const response = await GET(new Request('http://localhost/api/v1/shopping-sessions?status=active'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: { id: 'session-active' } })
    expect(mockedGetActiveShoppingSession).toHaveBeenCalledTimes(1)
    expect(mockedGetShoppingHistory).not.toHaveBeenCalled()
  })

  it('returns completed sessions when status=completed', async () => {
    mockedGetShoppingHistory.mockResolvedValueOnce([{ id: 'session-1' }] as never)

    const response = await GET(new Request('http://localhost/api/v1/shopping-sessions?status=completed'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: [{ id: 'session-1' }] })
    expect(mockedGetShoppingHistory).toHaveBeenCalledTimes(1)
    expect(mockedGetActiveShoppingSession).not.toHaveBeenCalled()
  })

  it('accepts an optional store and returns the created session', async () => {
    mockedCreateShoppingSession.mockResolvedValueOnce({ id: 'session-1', store_id: 'store-1' } as never)

    const response = await POST(new Request('http://localhost/api/v1/shopping-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_list_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Trip', store_id: '6ba7b810-9dad-41d4-80b4-00c04fd430c8' }),
    }))

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ data: { id: 'session-1', store_id: 'store-1' } })
    expect(mockedCreateShoppingSession).toHaveBeenCalledWith(expect.objectContaining({ store_id: '6ba7b810-9dad-41d4-80b4-00c04fd430c8' }))
  })

  it('rejects an invalid store id before calling the service', async () => {
    const response = await POST(new Request('http://localhost/api/v1/shopping-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_list_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Trip', store_id: 'bad-id' }),
    }))

    expect(response.status).toBe(422)
    expect(mockedCreateShoppingSession).not.toHaveBeenCalled()
  })

  it('returns an active-session conflict with its id', async () => {
    mockedCreateShoppingSession.mockRejectedValueOnce(new ApiServiceError(
      409,
      ErrorCode.CONFLICT,
      'This list already has a shopping session in progress.',
      { activeSessionId: 'active-session' },
    ))

    const response = await POST(new Request('http://localhost/api/v1/shopping-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_list_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Trip' }),
    }))

    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatchObject({ code: ErrorCode.CONFLICT, details: { activeSessionId: 'active-session' } })
  })
})
