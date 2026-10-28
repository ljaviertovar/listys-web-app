import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getShoppingSession } from '@/actions'
import ShoppingRunPage from '../[runId]/page'

const mocks = vi.hoisted(() => ({
	baseListItemReads: [] as string[],
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
				single: async () => ({ data: { name: 'My Lists' } }),
				then: (resolve: (value: unknown) => void) =>
					resolve({ data: [{ normalized_name: 'milk', average_price: 3.5 }, { normalized_name: 'bread', average_price: null }] }),
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

	it('shows no estimate, no prices and reads no price data for a completed session', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)

		const html = await render()

		expect(html).not.toContain('session-estimate-card')
		expect(html).not.toContain('Estimated total')
		expect(html).toContain('data-prices="null"')
		expect(mocks.baseListItemReads).toEqual([])
	})

	it('shows the paid total and receipt link for a session reconciled with a receipt', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({
			data: { ...session('completed'), receipt: { id: 'ticket-1', total_amount: 38.5 } }, error: null,
		} as never)

		const html = await render()

		expect(html).toContain('data-testid="session-receipt-summary"')
		expect(html).toContain('Paid from receipt')
		expect(html).toContain('$38.50')
		expect(html).toContain('href="/tickets/ticket-1"')
		expect(html).toContain('View Receipt')
		expect(html).not.toContain('Estimated total')
	})
})

// The origin rules live in resolveSessionBackLink and are covered there; this checks the page hands them its search params.
describe('shopping session page back link', () => {
	it('goes back to the history with the list it was narrowed to', async () => {
		vi.mocked(getShoppingSession).mockResolvedValue({ data: session('completed'), error: null } as never)

		const html = await render({ from: 'history', list: 'list-1' })

		expect(html).toContain('href="/shopping-history?list=list-1"')
		expect(html).toContain('Back to Shopping History')
	})
})
