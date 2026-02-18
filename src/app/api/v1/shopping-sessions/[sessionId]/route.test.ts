import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/shopping-sessions.service', () => ({
  cancelShoppingSession: vi.fn(),
  getShoppingSession: vi.fn(),
  updateShoppingSession: vi.fn(),
}))

import { DELETE } from './route'
import { cancelShoppingSession } from '@/lib/server/services/shopping-sessions.service'

const mockedCancelShoppingSession = vi.mocked(cancelShoppingSession)
const SESSION_ID = '11111111-1111-4111-8111-111111111111'

describe('DELETE /api/v1/shopping-sessions/:sessionId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cancels session and returns 204', async () => {
    mockedCancelShoppingSession.mockResolvedValueOnce({ success: true } as any)

    const response = await DELETE(new Request('http://localhost/api/v1/shopping-sessions/' + SESSION_ID), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    })

    expect(response.status).toBe(204)
    expect(mockedCancelShoppingSession).toHaveBeenCalledWith(SESSION_ID)
  })
})
