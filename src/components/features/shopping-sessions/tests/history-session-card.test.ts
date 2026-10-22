import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { HistorySessionCard } from '@/components/features/shopping-sessions'

vi.mock('next/link', () => ({ default: ({ children }: { children: unknown }) => children }))

const session = {
	id: 's1',
	name: 'Weekly grocery',
	status: 'completed',
	started_at: '2026-10-15T22:00:00Z',
	completed_at: '2026-10-15T23:21:00Z',
	total_amount: 86.4,
	purchased_count: 14,
	base_list: { name: 'Weekly Groceries' },
}

describe('HistorySessionCard', () => {
	it('reads "Completed on" with the date and the total on one line', () => {
		const html = renderToStaticMarkup(createElement(HistorySessionCard, { session }))
		expect(html).toContain('Completed on')
		expect(html).toContain('$86.40')
		expect(html).not.toContain('Shopping:')
	})

	it('keeps the purchased count and the View Details link', () => {
		const html = renderToStaticMarkup(createElement(HistorySessionCard, { session }))
		expect(html).toContain('Purchased Items')
		expect(html).toContain('View Details')
	})

	it('shows a known zero separately from an unknown purchased count', () => {
		const knownZero = renderToStaticMarkup(createElement(HistorySessionCard, { session: { ...session, purchased_count: 0 } }))
		const unknown = renderToStaticMarkup(
			createElement(HistorySessionCard, { session: { ...session, purchased_count: null, total_items: null } }),
		)

		expect(knownZero).toContain('>0</b>')
		expect(knownZero).toContain('Purchased Items')
		expect(unknown).toContain('Item count unavailable')
		expect(unknown).not.toContain('>0</b>')
	})

	it('formats a known zero amount but omits an unknown amount', () => {
		const knownZero = renderToStaticMarkup(createElement(HistorySessionCard, { session: { ...session, total_amount: 0 } }))
		const unknown = renderToStaticMarkup(createElement(HistorySessionCard, { session: { ...session, total_amount: null } }))

		expect(knownZero).toContain('$0.00')
		expect(unknown).not.toContain('$0.00')
	})
})
