import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/server/services/tickets.service', () => ({
  deleteTicket: vi.fn(),
  getTicket: vi.fn(),
  updateTicket: vi.fn(),
}))

import { PATCH } from './route'
import { updateTicket } from '@/lib/server/services/tickets.service'

const mockedUpdateTicket = vi.mocked(updateTicket)
const TICKET_ID = '22222222-2222-4222-8222-222222222222'
const GROUP_ID = '33333333-3333-4333-8333-333333333333'

describe('PATCH /api/v1/tickets/:ticketId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates ticket group_id', async () => {
    mockedUpdateTicket.mockResolvedValueOnce({ id: TICKET_ID, group_id: GROUP_ID } as any)

    const response = await PATCH(
      new Request('http://localhost/api/v1/tickets/' + TICKET_ID, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: GROUP_ID }),
      }),
      { params: Promise.resolve({ ticketId: TICKET_ID }) }
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: { id: TICKET_ID, group_id: GROUP_ID } })
    expect(mockedUpdateTicket).toHaveBeenCalledWith(TICKET_ID, { group_id: GROUP_ID })
  })
})
