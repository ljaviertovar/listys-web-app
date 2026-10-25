import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { getBaseLists, getShoppingHistory } from '@/lib/api/endpoints'
import HistoryPage from '../page'

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => '/shopping-history',
	useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) } }),
}))
vi.mock('@/lib/api/endpoints', async importOriginal => ({
	...(await importOriginal<typeof import('@/lib/api/endpoints')>()),
	getShoppingHistory: vi.fn(),
	getBaseLists: vi.fn(),
}))

const trip = (id: string, base_list_id: string, completed_at: string) => ({
	id,
	name: `Trip ${id}`,
	status: 'completed',
	base_list_id,
	completed_at,
	started_at: completed_at,
	total_amount: 10,
	purchased_count: 2,
	base_list: { name: 'whatever' },
})
const list = (id: string, name: string, created_at = '2026-01-01T00:00:00Z') => ({ id, name, created_at, items: [{ count: 1 }] })

const render = async (searchParams: Record<string, string | string[]> = {}) =>
	renderToStaticMarkup(await HistoryPage({ searchParams: Promise.resolve(searchParams) }))
// What the user reads: the markup itself carries Tailwind `group` classes.
const text = (html: string) => html.replace(/<[^>]*>/g, ' ')

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(getBaseLists).mockResolvedValue({ data: [list('l1', 'Pantry'), list('l2', 'Costco')], error: null } as never)
})

describe('shopping history page', () => {
	it('shows only the retryable error when loading fails with no returned sessions', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({ data: null, error: 'private backend detail' } as never)

		const html = await render()

		expect(html).toContain('data-testid="history-load-error"')
		expect(html).toContain('We couldn’t load your shopping history.')
		expect(html).toContain('href="/shopping-history"')
		expect(html).not.toContain('No shopping history yet')
		expect(html).not.toContain('private backend detail')
	})

	it('does not say there is no history when only the lists failed to load', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({ data: [trip('t1', 'l1', '2026-02-01T10:00:00Z')], error: null } as never)
		vi.mocked(getBaseLists).mockResolvedValue({ data: null, error: 'boom' } as never)

		const html = await render()

		expect(html).toContain('data-testid="history-load-error"')
		expect(html).not.toContain('No shopping history yet')
	})

	it('shows the empty state only after a successful empty response', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({ data: [], error: null } as never)

		const html = await render()

		expect(html).toContain('No shopping history yet')
		expect(html).not.toContain('history-load-error')
		expect(html).not.toContain('history-list-filter')
		expect(text(html)).not.toMatch(/group/i)
	})

	it('lists every trip of every list in the order the service returns them, with no group wording', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({
			data: [trip('t2', 'l2', '2026-03-01T10:00:00Z'), trip('t1', 'l1', '2026-02-01T10:00:00Z')],
			error: null,
		} as never)

		const html = await render()

		expect(html.indexOf('history-card-t2')).toBeGreaterThan(-1)
		expect(html.indexOf('history-card-t2')).toBeLessThan(html.indexOf('history-card-t1'))
		expect(html).toContain('data-testid="history-list-filter"')
		expect(text(html)).not.toMatch(/group/i)
	})

	it('narrows to the list in the URL and carries it to the trip links', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({
			data: [trip('t2', 'l2', '2026-03-01T10:00:00Z'), trip('t1', 'l1', '2026-02-01T10:00:00Z')],
			error: null,
		} as never)

		const html = await render({ list: 'l1' })

		expect(html).toContain('history-card-t1')
		expect(html).not.toContain('history-card-t2')
		expect(html).toContain('href="/shopping/t1?from=history&amp;list=l1"')
	})

	it('treats an unknown list value as all trips, without an error', async () => {
		vi.mocked(getShoppingHistory).mockResolvedValue({
			data: [trip('t2', 'l2', '2026-03-01T10:00:00Z'), trip('t1', 'l1', '2026-02-01T10:00:00Z')],
			error: null,
		} as never)

		const html = await render({ list: '11111111-1111-4111-8111-111111111111' })

		expect(html).toContain('history-card-t1')
		expect(html).toContain('history-card-t2')
		expect(html).toContain('href="/shopping/t1?from=history"')
		expect(html).not.toContain('history-load-error')
	})
})
