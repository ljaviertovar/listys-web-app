import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { TripReceiptSummary } from '../trip-receipt-summary'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const trip: TicketSessionCandidate = {
	id: 'trip-1',
	name: 'Pantry trip',
	status: 'completed',
	started_at: '2026-11-01T14:00:00Z',
	completed_at: '2026-11-01T15:00:00Z',
	store: null,
	base_list: { id: 'list-1', name: 'Pantry' },
	checked_count: 1,
	item_count: 1,
}

describe('active trip receipts for a viewer', () => {
	it.each(['active', 'completed'] as const)('keeps incomplete attached totals unavailable in %s mode', mode => {
		const receipts = [
			{ id: 'a', attached: true, total_amount: 41.12, store: null, items_count: 1 },
			{ id: 'b', attached: true, total_amount: null, store: null, items_count: 1 },
		]
		const paid = () => renderToStaticMarkup(createElement(TripReceiptSummary, { mode, itemCount: 2, receipts })).match(/<h2[^>]*>Paid(?: so far)?<\/h2><p[^>]*>(.*?)<\/p>/)?.[1]
		expect(paid()).toBe('—')
		receipts[1].attached = false
		expect(paid()).toBe('$41.12')
	})
	it.each(['active', 'completed'] as const)('sums confirmed attached totals in %s mode', mode => {
		const html = renderToStaticMarkup(createElement(TripReceiptSummary, { mode, itemCount: 2, receipts: [
			{ id: 'a', attached: true, total_amount: 82.5, store: null, items_count: 1 },
			{ id: 'b', attached: true, total_amount: 41.12, store: null, items_count: 1 },
			{ id: 'pending', attached: false, total_amount: 20, store: null, items_count: 1 },
		] }))
		expect(html).toContain('$123.62')
		expect(html).not.toContain('$143.62')
	})
	it('does not offer attachment for a historical completed receipt with no lines', () => {
		const html = renderToStaticMarkup(
			createElement(TripReceiptSummary, {
				mode: 'active',
				itemCount: 1,
				receipts: [
					{ id: 'empty', attached: false, ocr_status: 'completed', total_amount: 10, store: null, items_count: 0 },
				],
			}),
		)
		expect(html).not.toContain('Pending attachment')
		expect(html).not.toContain('Review Receipt')
		expect(html).not.toContain('href="/tickets/empty"')
	})
	it('shows attached money and pending receipt status without management actions', () => {
		const html = renderToStaticMarkup(
			createElement(TripReceiptSummary, {
				mode: 'active',
				itemCount: 3,
				receipts: [
					{ id: 'a', attached: true, total_amount: 41.12, store: null, items_count: 1 },
					{ id: 'b', attached: false, ocr_status: 'completed', total_amount: 86.4, store: null, items_count: 2 },
				],
			}),
		)
		expect(html).toContain('$41.12')
		expect(html).toContain('Ready for Review')
		expect(html).not.toContain('Review Receipt')
		expect(html).not.toContain('Attach Receipt')
		expect(html).toContain('View Receipt')
		expect(html).not.toContain('href="/tickets/a"')
	})
	it.each([
		['pending', 'Processing'],
		['processing', 'Processing'],
		['completed', 'Ready for Review'],
		['failed', 'Failed'],
	])('shows the %s receipt as a status chip', (ocr_status, label) => {
		const html = renderToStaticMarkup(
			createElement(TripReceiptSummary, {
				mode: 'completed',
				itemCount: 3,
				receipts: [{ id: 'receipt-1', attached: false, ocr_status, total_amount: null, store: null, items_count: 1 }],
			}),
		)
		expect(html).toContain(`data-testid="trip-receipt-status-receipt-1"`)
		expect(html).toContain(label)
		expect(html).not.toContain('Reading your receipt')
	})
	it('opens failed receipts for review in a sheet instead of linking to the receipt page', () => {
		const html = renderToStaticMarkup(
			createElement(TripReceiptSummary, {
				mode: 'completed',
				itemCount: 1,
				trip,
				receipts: [
					{ id: 'failed-1', attached: false, ocr_status: 'failed', total_amount: null, store: null, items_count: 0 },
				],
			}),
		)
		expect(html).toContain('Review Receipt')
		expect(html).not.toContain('Open Receipt')
		expect(html).not.toContain('href="/tickets/failed-1"')
	})
})
