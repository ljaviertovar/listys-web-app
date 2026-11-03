import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TicketSessionCandidate } from '@/lib/api/endpoints'

import type { TripReceiptState } from '../helpers/get-trip-receipt-state'
import { TripReceiptsCard } from '../trip-receipts-card'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }))

const trip: TicketSessionCandidate = {
	id: 'trip-1',
	name: 'Saturday shop',
	status: 'completed',
	started_at: '2026-11-01T14:00:00Z',
	completed_at: '2026-11-01T15:00:00Z',
	store: null,
	base_list: { id: 'list-1', name: 'Pantry' },
	checked_count: 3,
	item_count: 4,
}

const render = (state: Exclude<TripReceiptState, { kind: 'attached' }>, props: Partial<Parameters<typeof TripReceiptsCard>[0]> = {}) =>
	renderToStaticMarkup(createElement(TripReceiptsCard, { state, itemCount: 3, listName: 'Pantry', trip, ...props }))

describe('TripReceiptsCard', () => {
	it('highlights Add Receipt for a trip without a receipt, with no deadline and no Keep It Separate', () => {
		const html = render({ kind: 'none' })
		expect(html).toContain('data-state="no-receipt"')
		expect(html).toContain('No receipt')
		expect(html).toContain('Add Receipt')
		expect(html).not.toContain('Keep It Separate')
		expect(html).not.toMatch(/48 hours/)
	})

	it('invites the receipt right after saving the trip and lets the user keep it separate', () => {
		const html = render({ kind: 'none' }, { justSaved: true })
		expect(html).toContain('data-state="saved"')
		expect(html).toContain('Trip saved')
		expect(html).toContain('3 items updated in Pantry')
		expect(html).toContain('Upload a Receipt')
		expect(html).toContain('Keep It Separate')
	})

	it('shows the receipt being read, with its status and nothing to press, and not the review text', () => {
		const html = render({ kind: 'reading', ticketId: 't1' })
		expect(html).toContain('data-testid="trip-receipt-reading-status"')
		expect(html).toContain('Reading Receipt')
		expect(html).not.toContain('<button')
		expect(html).not.toContain('Review how this receipt will update the trip')
	})

	it('offers Review Receipt once the receipt is read, still without the review text', () => {
		const html = render({ kind: 'read', ticketId: 't1' })
		expect(html).toContain('data-state="read"')
		expect(html).toContain('Review Receipt')
		expect(html).not.toContain('Review how this receipt will update the trip')
	})

	it('explains a receipt that could not be read and links to it', () => {
		const html = render({ kind: 'failed', ticketId: 't1' })
		expect(html).toContain('couldn’t read this receipt')
		expect(html).toContain('href="/tickets/t1"')
		expect(html).toContain('Add Receipt')
	})

	it('only informs a viewer who did not run the trip', () => {
		const html = render({ kind: 'none' }, { trip: undefined, justSaved: true })
		expect(html).toContain('Trip saved')
		expect(html).not.toContain('<button')
		expect(html).not.toContain('Keep It Separate')
	})
})
