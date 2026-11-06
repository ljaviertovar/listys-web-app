import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TripReceiptSummary } from '../trip-receipt-summary'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

describe('active trip receipts for a viewer', () => {
	it('does not offer attachment for a historical completed receipt with no lines', () => {
		const html = renderToStaticMarkup(createElement(TripReceiptSummary, { active: true, itemCount: 1, receipts: [
			{ id: 'empty', attached: false, ocr_status: 'completed', total_amount: 10, store: null, items_count: 0 },
		] }))
		expect(html).not.toContain('Pending attachment')
		expect(html).not.toContain('Review Receipt')
		expect(html).toContain('href="/tickets/empty"')
	})
	it('shows attached money and pending receipt status without management actions', () => {
		const html = renderToStaticMarkup(createElement(TripReceiptSummary, { active: true, itemCount: 3, receipts: [
			{ id: 'a', attached: true, total_amount: 41.12, store: null, items_count: 1 },
			{ id: 'b', attached: false, ocr_status: 'completed', total_amount: 86.4, store: null, items_count: 2 },
		] }))
		expect(html).toContain('$41.12')
		expect(html).toContain('Pending attachment')
		expect(html).not.toContain('Review Receipt')
		expect(html).not.toContain('Add Another Receipt')
		expect(html).toContain('View Receipt')
		expect(html).not.toContain('href="/tickets/a"')
	})
})
