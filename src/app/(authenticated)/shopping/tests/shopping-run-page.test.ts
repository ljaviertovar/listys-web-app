import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getShoppingSession } from '@/actions'
import ShoppingRunPage from '../[runId]/page'

const mocks = vi.hoisted(() => ({
	baseListItemReads: [] as string[],
	/** The latest receipt uploaded from the trip that is still free, as the page's tickets query returns it. */
	pendingReceipt: null as { id: string; ocr_status: string; total_items: number } | null,
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn(), useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/actions', () => ({ getShoppingSession: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({
		auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
		from: (table: string) => {
			const builder = {
				select: () => builder,
				eq: (_column: string, value: string) => {
					if (table === 'base_list_items') mocks.baseListItemReads.push(value)
					return builder
				},
				is: () => builder,
				order: () => builder,
				limit: () => builder,
				single: async () => ({ data: { name: 'My Lists' } }),
				maybeSingle: async () => ({ data: table === 'tickets' ? mocks.pendingReceipt : null }),
				then: (resolve: (value: unknown) => void) =>
					resolve({ data: table === 'tickets' ? (mocks.pendingReceipt ? [mocks.pendingReceipt] : []) : [{ normalized_name: 'milk', average_price: 3.5 }, { normalized_name: 'bread', average_price: null }] }),
			}
			return builder
		},
	}),
}))
vi.mock('@/components/features/list-items', () => ({ AddItemSheet: () => null }))
vi.mock('@/components/features/sharing', () => ({ ShareListDialog: () => null }))
vi.mock('@/components/features/shopping-sessions', async importOriginal => {
	const original = await importOriginal<typeof import('@/components/features/shopping-sessions')>()
	return {
		...original,
		ShoppingSessionActions: () => null,
		ShoppingSessionRealtimeListener: () => null,
		ShoppingSessionItems: (props: { priceByItemId?: Record<string, number> }) =>
			createElement('div', { 'data-testid': 'items-stub', 'data-prices': JSON.stringify(props.priceByItemId ?? null) }),
	}
})

const session = (status: 'active' | 'completed') => ({
	id: 'run-1',
	name: 'Weekly trip',
	status,
	user_id: 'user-1',
	base_list_id: 'list-1',
	base_list: { name: 'Pantry', user_id: 'user-1' },
	items: [
		{ id: 'i1', name: 'Milk', normalized_name: 'milk', checked: true },
		{ id: 'i2', name: 'Bread', normalized_name: 'bread', checked: true },
		{ id: 'i3', name: 'Eggs', normalized_name: 'eggs', checked: false },
	],
})

const render = async (searchParams: Record<string, string> = {}) =>
	renderToStaticMarkup(await ShoppingRunPage({ params: Promise.resolve({ runId: 'run-1' }), searchParams: Promise.resolve(searchParams) }))

describe('shopping session page estimate', () => {
	beforeEach(() => {
		mocks.baseListItemReads.length = 0
	})

	it('shows the estimate and the per-item prices for an active session', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('active'), error: null } as never)

		const html = await render()

		expect(html).toContain('data-testid="session-estimate-card"')
		expect(html).toContain('$3.50')
		expect(html).toContain('Estimated total')
		expect(html).toContain('data-prices="{&quot;i1&quot;:3.5}"')
		expect(mocks.baseListItemReads).toEqual(['list-1'])
	})

	it('shows a completed estimate without using average prices in completed item rows', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)

		const html = await render({ details: '1' })

		expect(html).toContain('session-estimate-card')
		expect(html).toContain('≈ $3.50')
		expect(html).toContain('data-prices="null"')
		expect(mocks.baseListItemReads).toEqual(['list-1'])
	})

	it('shows the paid total and receipt link for a session reconciled with a receipt', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({
			data: { ...session('completed'), receipts: [{ id: 'ticket-1', total_amount: 38.5, store: null, items_count: 2 }] }, error: null,
		} as never)

		const html = await render()

		expect(html).toContain('data-testid="session-receipt-summary"')
		expect(html).toContain('Paid')
		expect(html).toContain('$38.50')
		expect(html).toContain('data-testid="trip-receipt-ticket-1"')
		expect(html).toContain('View Receipt')
		expect(html).not.toContain('href="/tickets/ticket-1"')
		expect(html).not.toContain('Estimated total')
	})
})

describe('shopping session page receipts card', () => {
	it('shows both receipt stores, the summed paid total and the header hierarchy, with upload limited to the trip owner', async () => {
		const data = { ...session('completed'), store: { id: 'a', name: 'No Frills' }, completed_at: new Date(2026, 1, 19, 18, 40).toISOString(), receipts: [
			{ id: 'r1', total_amount: 86.4, store: { id: 'a', name: 'No Frills' }, items_count: 13 },
			{ id: 'r2', total_amount: 41.12, store: { id: 'b', name: 'Costco' }, items_count: 4 },
		] }
		vi.mocked(getShoppingSession).mockResolvedValue({ data, error: null } as never)
		const html = await render()
		expect(html).toContain('$127.52')
		expect(html).toContain('data-testid="trip-receipt-r1"')
		expect(html).toContain('data-testid="trip-receipt-r2"')
		expect(html).toContain('View Receipt')
		expect(html).not.toContain('href="/tickets/r1"')
		expect(html).not.toContain('href="/tickets/r2"')
		expect(html).toContain('Add Another Receipt')
		expect(html.indexOf('Completed')).toBeLessThan(html.indexOf('trip-header-classification'))
		expect(html.indexOf('No Frills')).toBeLessThan(html.indexOf('Costco'))
		expect(html.indexOf('2 receipts')).toBeLessThan(html.indexOf('trip-header-data'))
		vi.mocked(getShoppingSession).mockResolvedValue({ data: { ...data, user_id: 'other' }, error: null } as never)
		expect(await render()).not.toContain('Add Another Receipt')
	})
	beforeEach(() => {
		mocks.pendingReceipt = null
	})

	it('shows the saved trip screen first when no receipt was uploaded or attached', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)

		const html = await render()

		expect(html).toContain('data-state="saved"')
		expect(html).toContain('Trip saved')
		expect(html).toContain('2 items updated in Pantry')
		expect(html).toContain('View Trip')
		expect(html).toContain('Back to Trips')
		expect(html).toContain('href="/trips"')

		mocks.pendingReceipt = { id: 'ticket-9', ocr_status: 'completed', total_items: 1 }
		const uploadedReceipt = await render()
		expect(uploadedReceipt).not.toContain('data-state="saved"')
		expect(uploadedReceipt).toContain('1 uploaded receipt')
		expect(uploadedReceipt).toContain('data-testid="session-receipt-summary"')
		expect(uploadedReceipt).toContain('Pending attachment')
	})

	it('shows the trip details on request, and draws nothing when one is attached or the trip is running', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)
		const later = await render({ details: '1' })
		expect(later).toContain('data-state="no-receipt"')
		expect(later).toContain('No receipt')
		expect(later).toContain('Upload New Receipt')
		expect(later).not.toContain('Keep It Separate')

		vi.mocked(getShoppingSession).mockResolvedValue({
			data: { ...session('completed'), receipts: [{ id: 'ticket-1', total_amount: 38.5, store: null, items_count: 2 }] }, error: null,
		} as never)
		expect(await render()).not.toContain('trip-receipts-card')

		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('active'), error: null } as never)
		expect(await render()).not.toContain('trip-receipts-card')
	})
})

describe('shopping session page receipt status', () => {
	beforeEach(() => {
		mocks.pendingReceipt = null
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)
	})

	it('shows the saved view for a trip without an uploaded or attached receipt', async () => {
		const html = await render({ receipt: 'add' })
		expect(html).toContain('Trip saved')
		expect(html).toContain('Upload New Receipt')
	})

	it('marks a trip with a receipt as such and draws no receipts card', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: { ...session('completed'), receipts: [{ id: 'ticket-1', total_amount: 38.5, store: null, items_count: 2 }] }, error: null } as never)
		const html = await render()
		expect(html).toContain('Receipt attached')
		expect(html).not.toContain('trip-receipts-card')
	})

	it.each([
		['processing', 'Reading your receipt'],
		['pending', 'Reading your receipt'],
		['completed', 'Pending attachment'],
		['failed', 'We couldn&#x27;t read this receipt'],
	])('shows a receipt uploaded from the trip while it is %s', async (ocrStatus, text) => {
		mocks.pendingReceipt = { id: 'ticket-9', ocr_status: ocrStatus, total_items: 1 }
		const html = await render({ details: '1' })
		expect(html).toContain(text)
		expect(html).toContain('data-testid="session-receipt-summary"')
		if (ocrStatus === 'completed') expect(html).toContain('Review Receipt')
		expect(html).not.toContain('Review how this receipt will update the trip')
	})

	it('only tells a viewer who did not run the trip, and does not read their receipts', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: { ...session('completed'), user_id: 'someone-else' }, error: null } as never)
		mocks.pendingReceipt = { id: 'ticket-9', ocr_status: 'completed' }
		const html = await render({ receipt: 'add' })
		expect(html).toContain('Trip saved')
		expect(html).not.toContain('Upload New Receipt')
		expect(html).not.toContain('Review Receipt')
	})
})

// The origin rules live in resolveSessionBackLink and are covered there; this checks the page hands them its search params.
describe('shopping session page back link', () => {
	it('goes back to the history with the list it was narrowed to', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)

		const html = await render({ from: 'trips', list: 'list-1' })

		expect(html).toContain('href="/trips?list=list-1"')
		expect(html).toContain('Back to Trips')
	})
})
