import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/shopping-sessions.service', () => ({
  cancelShoppingSession: vi.fn(),
}))

import { POST } from './route'
import { cancelShoppingSession } from '@/lib/server/services/shopping-sessions.service'

const mockedCancelShoppingSession = vi.mocked(cancelShoppingSession)
const SESSION_ID = '11111111-1111-4111-8111-111111111111'

describe('POST /api/v1/shopping-sessions/:sessionId/cancel (deprecated)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns deprecation headers and success payload', async () => {
    mockedCancelShoppingSession.mockResolvedValueOnce({ success: true } as any)

    const response = await POST(new Request('http://localhost/api/v1/shopping-sessions/' + SESSION_ID + '/cancel'), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: { success: true } })
    expect(response.headers.get('Deprecation')).toBe('true')
    expect(response.headers.get('Sunset')).toBeTruthy()
    expect(response.headers.get('Link')).toContain('/api/v1/shopping-sessions/{sessionId}')
  })
})
