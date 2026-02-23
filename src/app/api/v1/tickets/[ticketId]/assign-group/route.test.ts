import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/tickets.service', () => ({
  assignTicketToGroup: vi.fn(),
}))

import { POST } from './route'
import { assignTicketToGroup } from '@/lib/server/services/tickets.service'

const mockedAssignTicketToGroup = vi.mocked(assignTicketToGroup)
const TICKET_ID = '22222222-2222-4222-8222-222222222222'
const GROUP_ID = '33333333-3333-4333-8333-333333333333'

describe('POST /api/v1/tickets/:ticketId/assign-group (deprecated)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns deprecation headers and success payload', async () => {
    mockedAssignTicketToGroup.mockResolvedValueOnce({ success: true } as any)

    const response = await POST(
      new Request('http://localhost/api/v1/tickets/' + TICKET_ID + '/assign-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: GROUP_ID }),
      }),
      { params: Promise.resolve({ ticketId: TICKET_ID }) }
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: { success: true } })
    expect(mockedAssignTicketToGroup).toHaveBeenCalledWith(TICKET_ID, GROUP_ID)
    expect(response.headers.get('Deprecation')).toBe('true')
    expect(response.headers.get('Sunset')).toBeTruthy()
    expect(response.headers.get('Link')).toContain('/api/v1/tickets/{ticketId}')
  })
})
