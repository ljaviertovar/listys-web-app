import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LikelyNeededCard } from '../likely-needed-card'
import { MonthSpendingCard } from '../month-spending-card'
import { useSpendingSummary } from '../hooks/use-spending-summary'

vi.mock('../hooks/use-spending-summary', () => ({ useSpendingSummary: vi.fn() }))

const mockSpending = vi.mocked(useSpendingSummary)

function markup(...children: ReturnType<typeof createElement>[]) {
	return renderToStaticMarkup(createElement('main', null, ...children))
}

describe('dashboard cards', () => {
	beforeEach(() => vi.clearAllMocks())

	it('distinguishes insufficient purchase history from items that are not due', () => {
		const noHistory = renderToStaticMarkup(createElement(LikelyNeededCard, { likelyNeeded: { hasHistory: false, receiptsCount: 0, items: [] } }))
		const notDue = renderToStaticMarkup(createElement(LikelyNeededCard, { likelyNeeded: { hasHistory: true, receiptsCount: 3, items: [] } }))
		expect(noHistory).toContain('Suggestions start after 3 receipts')
		expect(noHistory).not.toContain('0 of 3 receipts')
		expect(notDue).toContain('Nothing looks due yet.')
	})

	it('shows only known spending, counts, and trips with missing totals', () => {
		mockSpending.mockReturnValue({
			status: 'ready', retry: vi.fn(),
			summary: { from: '2026-10-01T00:00:00Z', to: '2026-11-01T00:00:00Z', total: 95, receipt_total: 95, receipt_count: 1, trips_count: 2, receipts_count: 1, trips_without_total: 1 },
		})
		const html = renderToStaticMarkup(createElement(MonthSpendingCard))
		expect(mockSpending).toHaveBeenCalledWith('month')
		expect(html).toContain('dashboard-month-spending-scope')
		expect(html).toContain('$95.00')
		expect(html).toContain('Trips without a receipt')
		expect(html).toContain('counted.')
	})

	it('tells an empty month from an empty account and offers the rest of the history', () => {
		mockSpending.mockReturnValue({
			status: 'ready', retry: vi.fn(),
			summary: { from: '2026-11-01T00:00:00Z', to: '2026-12-01T00:00:00Z', total: 0, receipt_total: 0, receipt_count: 0, trips_count: 0, receipts_count: 0, trips_without_total: 0, first_receipt_at: '2026-03-04T10:00:00', last_receipt_at: `${new Date().getFullYear()}-10-28T12:00:00` },
		})
		const html = renderToStaticMarkup(createElement(MonthSpendingCard))
		expect(html).toContain('No receipts in November yet')
		expect(html).toContain('Your last receipt was on Oct 28.')
		expect(html).toContain('dashboard-month-spending-see-all')
		expect(html).toContain('See All Time')
		expect(html).not.toContain('$0')
		expect(html).not.toContain('Upload a receipt to see your spending here.')
	})

	it('keeps the new-account wording without a last receipt, and never offers See All Time on all time', () => {
		mockSpending.mockReturnValue({
			status: 'ready', retry: vi.fn(),
			summary: { from: '2026-11-01T00:00:00Z', to: '2026-12-01T00:00:00Z', total: 0, receipt_total: 0, receipt_count: 0, trips_count: 0, receipts_count: 0, trips_without_total: 0, last_receipt_at: null },
		})
		const html = renderToStaticMarkup(createElement(MonthSpendingCard))
		expect(html).toContain('No receipt spending recorded this month.')
		expect(html).not.toContain('See All Time')
	})

	it('omits a zero amount when no totals are known and keeps its error within the card', () => {
		mockSpending.mockReturnValue({
			status: 'ready', retry: vi.fn(),
			summary: { from: '', to: '', total: 0, receipt_total: 0, receipt_count: 0, trips_count: 0, receipts_count: 0, trips_without_total: 2 },
		})
		const empty = renderToStaticMarkup(createElement(MonthSpendingCard))
		expect(empty).toContain('No receipt spending recorded this month.')
		expect(empty).not.toContain('$0')
		expect(empty).not.toContain('$0')

		mockSpending.mockReturnValue({ status: 'error', retry: vi.fn() })
		const withSibling = markup(createElement(MonthSpendingCard), createElement(LikelyNeededCard, { likelyNeeded: { hasHistory: false, items: [] } }))
		expect(withSibling).toContain('dashboard-month-spending-error')
		expect(withSibling).toContain('dashboard-likely-needed-card')
		expect(withSibling).toContain('Try Again')
	})
})
