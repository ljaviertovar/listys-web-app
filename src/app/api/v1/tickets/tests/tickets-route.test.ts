import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/server/services/tickets.service', () => ({
	getTickets: vi.fn(),
	uploadTicket: vi.fn(),
}))

import { getTickets } from '@/lib/server/services/tickets.service'
import { GET } from '../route'

const mockedGetTickets = vi.mocked(getTickets)

describe('GET /api/v1/tickets', () => {
	beforeEach(() => vi.clearAllMocks())

	it('keeps the full collection as the default', async () => {
		mockedGetTickets.mockResolvedValue([{ id: 'ticket-1' }] as never)

		const response = await GET(new Request('http://localhost/api/v1/tickets'))

		expect(response.status).toBe(200)
		expect(mockedGetTickets).toHaveBeenCalledWith(undefined)
		expect(await response.json()).toMatchObject({ data: [{ id: 'ticket-1' }] })
	})

	it('supports a direct-upload collection for the Receipts section', async () => {
		mockedGetTickets.mockResolvedValue([] as never)

		const response = await GET(new Request('http://localhost/api/v1/tickets?source=direct'))

		expect(response.status).toBe(200)
		expect(mockedGetTickets).toHaveBeenCalledWith('direct')
	})

	it('rejects unknown collection filters before reading tickets', async () => {
		const response = await GET(new Request('http://localhost/api/v1/tickets?source=trip'))

		expect(response.status).toBe(422)
		expect(mockedGetTickets).not.toHaveBeenCalled()
	})
})
