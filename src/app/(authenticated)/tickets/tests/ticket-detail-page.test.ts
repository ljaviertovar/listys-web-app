import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ notFound: vi.fn(), redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } } }) } }),
}))
vi.mock('@/lib/api/endpoints', () => ({ getTicket: vi.fn() }))
vi.mock('@/components/app', () => ({
	PageHeader: () => null,
	PageContainer: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('@/components/features/tickets', async () => ({
	...await import('@/components/features/tickets/helpers/receipt-spending'),
	...await import('@/components/features/tickets/helpers/ticket-status'),
	TicketReview: ({ before }: { before: ReactNode }) => before,
	TicketSpendingCard: vi.fn(() => null),
	TicketStatusChip: () => null,
	TicketStoreCard: () => null,
	TicketSummaryCard: () => null,
	TicketUnreadableState: () => null,
	sumLineTotals: () => 0,
}))

import { getTicket } from '@/lib/api/endpoints'
import { TicketSpendingCard } from '@/components/features/tickets'
import TicketDetailPage from '../[ticketId]/page'

beforeEach(() => vi.clearAllMocks())

describe('receipt detail spending control', () => {
	it.each([
		{ status: 'failed', itemCount: 0, attached: false, visible: false },
		{ status: 'failed', itemCount: 1, attached: false, visible: false },
		{ status: 'completed', itemCount: 0, attached: false, visible: false },
		{ status: 'completed', itemCount: 1, attached: false, visible: true },
		{ status: 'pending', itemCount: 0, attached: false, visible: true },
		{ status: 'processing', itemCount: 0, attached: false, visible: true },
		{ status: 'completed', itemCount: 1, attached: true, visible: false },
	])('sets visibility to $visible for $status, $itemCount items, attached=$attached', async ({ status, itemCount, attached, visible }) => {
		vi.mocked(getTicket).mockResolvedValue({ data: {
			id: 'receipt-1', ocr_status: status, total_amount: 2, include_in_spending: true,
			shopping_session_id: attached ? 'trip-1' : null,
			items: Array.from({ length: itemCount }, () => ({ price: 2 })),
		} } as never)
		renderToStaticMarkup(await TicketDetailPage({ params: Promise.resolve({ ticketId: 'receipt-1' }) }))
		expect(TicketSpendingCard).toHaveBeenCalledTimes(visible ? 1 : 0)
	})
})
