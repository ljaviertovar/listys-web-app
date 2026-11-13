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
	it('offers the direct upload for a trip without a receipt', () => {
		const html = render({ kind: 'none' })
		expect(html).toContain('data-state="no-receipt"')
		expect(html).toContain('No receipt')
		expect(html).toContain('Attach Receipt')
		expect(html).not.toMatch(/48 hours/)
	})

	it('offers upload and view trip right after saving', () => {
		const html = render({ kind: 'none' }, { justSaved: true })
		expect(html).toContain('data-state="saved"')
		expect(html).toContain('Trip saved')
		expect(html).toContain('3 items updated in Pantry')
		expect(html).toContain('Attach Receipt')
		expect(html).toContain('View Trip')
		expect(html).toContain('href="/shopping/trip-1?details=1&amp;from=trip-saved"')
	})

	it('shows reading without a button or status chip', () => {
		const html = render({ kind: 'reading', ticketId: 't1' })
		expect(html).toContain('data-state="reading"')
		expect(html).not.toContain('trip-receipt-status-chip')
		expect(html).not.toContain('<button')
		expect(html).not.toContain('Review how this receipt will update the trip')
	})

	it('shows the ready message without an action button once the receipt is read', () => {
		const html = render({ kind: 'read', ticketId: 't1' })
		expect(html).toContain('data-state="read"')
		expect(html).toContain('Your receipt is ready')
		expect(html).not.toContain('<button')
		expect(html).not.toContain('Review how this receipt will update the trip')
	})

	it('explains a receipt that could not be read and links to it', () => {
		const html = render({ kind: 'failed', ticketId: 't1' })
		expect(html).toContain('couldn’t read this receipt')
		expect(html).toContain('href="/tickets/t1"')
		expect(html).toContain('Upload Receipt')
	})

	it('only informs a viewer who did not run the trip', () => {
		const html = render({ kind: 'none' }, { trip: undefined, justSaved: true })
		expect(html).toContain('Trip saved')
		expect(html).not.toContain('<button')
	})
})
