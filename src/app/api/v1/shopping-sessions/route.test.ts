import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/shopping-sessions.service', () => ({
  createShoppingSession: vi.fn(),
  getActiveShoppingSession: vi.fn(),
  getShoppingHistory: vi.fn(),
}))

import { GET } from './route'
import { getActiveShoppingSession, getShoppingHistory } from '@/lib/server/services/shopping-sessions.service'

const mockedGetActiveShoppingSession = vi.mocked(getActiveShoppingSession)
const mockedGetShoppingHistory = vi.mocked(getShoppingHistory)

describe('GET /api/v1/shopping-sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns active session when status=active', async () => {
    mockedGetActiveShoppingSession.mockResolvedValueOnce({ id: 'session-active' } as any)

    const response = await GET(new Request('http://localhost/api/v1/shopping-sessions?status=active'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: { id: 'session-active' } })
    expect(mockedGetActiveShoppingSession).toHaveBeenCalledTimes(1)
    expect(mockedGetShoppingHistory).not.toHaveBeenCalled()
  })

  it('returns completed sessions when status=completed', async () => {
    mockedGetShoppingHistory.mockResolvedValueOnce([{ id: 'session-1' }] as any)

    const response = await GET(new Request('http://localhost/api/v1/shopping-sessions?status=completed'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: [{ id: 'session-1' }] })
    expect(mockedGetShoppingHistory).toHaveBeenCalledTimes(1)
    expect(mockedGetActiveShoppingSession).not.toHaveBeenCalled()
  })
})
