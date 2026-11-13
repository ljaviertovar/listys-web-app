import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LikelyNeededCard } from '../likely-needed-card'
import { MonthSpendingCard } from '../month-spending-card'
import { useMonthSpending } from '../hooks/use-month-spending'

vi.mock('../hooks/use-month-spending', () => ({ useMonthSpending: vi.fn() }))

const mockSpending = vi.mocked(useMonthSpending)

function markup(...children: ReturnType<typeof createElement>[]) {
	return renderToStaticMarkup(createElement('main', null, ...children))
}

describe('dashboard cards', () => {
	beforeEach(() => vi.clearAllMocks())

	it('distinguishes insufficient purchase history from items that are not due', () => {
		const noHistory = renderToStaticMarkup(createElement(LikelyNeededCard, { likelyNeeded: { hasHistory: false, receiptsCount: 0, items: [] } }))
		const notDue = renderToStaticMarkup(createElement(LikelyNeededCard, { likelyNeeded: { hasHistory: true, receiptsCount: 3, items: [] } }))
		expect(noHistory).toContain('0 of 3 receipts')
		expect(noHistory).toContain('Scan three receipts to start getting suggestions')
		expect(notDue).toContain('Nothing looks due yet.')
	})

	it('shows only known spending, counts, and trips with missing totals', () => {
		mockSpending.mockReturnValue({
			status: 'ready', retry: vi.fn(),
			summary: { from: '2026-10-01T00:00:00Z', to: '2026-11-01T00:00:00Z', total: 95, receipt_total: 95, receipt_count: 1, trips_count: 2, receipts_count: 1, trips_without_total: 1 },
		})
		const html = renderToStaticMarkup(createElement(MonthSpendingCard))
		expect(html).toContain('$95.00')
		expect(html).toContain('From 1 receipts. Trips without a receipt aren’t counted.')
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
