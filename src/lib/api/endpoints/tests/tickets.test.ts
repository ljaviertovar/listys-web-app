import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiPost } from '@/lib/api/client'
import { mergeTicketItemsToBaseList } from '@/lib/api/endpoints/tickets'

vi.mock('@/lib/api/client', () => ({
	apiDelete: vi.fn(),
	apiGet: vi.fn(),
	apiPatch: vi.fn(),
	apiPost: vi.fn(),
}))

describe('mergeTicketItemsToBaseList', () => {
	beforeEach(() => vi.clearAllMocks())

	it('keeps the returned summary when the API supplies counts', async () => {
		const summary = { success: true, new_count: 2, updated_count: 1, skipped_count: 0 }
		vi.mocked(apiPost).mockResolvedValueOnce({ data: summary })

		const result = await mergeTicketItemsToBaseList({ ticket_id: 'ticket-1', base_list_id: 'list-1', items: [] })

		expect(result).toEqual(summary)
		expect(apiPost).toHaveBeenCalledWith('/api/v1/tickets/ticket-1/merge-to-base-list', { base_list_id: 'list-1', items: [] })
	})

	it('returns generic success without inventing zero counts when the response has no summary', async () => {
		vi.mocked(apiPost).mockResolvedValueOnce({ data: undefined })

		const result = await mergeTicketItemsToBaseList({ ticket_id: 'ticket-1', base_list_id: 'list-1', items: [] })

		expect(result).toEqual({ success: true })
	})

	it('preserves an API error', async () => {
		vi.mocked(apiPost).mockResolvedValueOnce({ error: 'Request failed' })

		const result = await mergeTicketItemsToBaseList({ ticket_id: 'ticket-1', base_list_id: 'list-1', items: [] })

		expect(result).toEqual({ error: 'Request failed' })
	})
})
