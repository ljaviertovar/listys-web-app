import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { getGroup, getShoppingHistory } from '@/lib/api/endpoints'
import GroupHistoryPage from '../[groupId]/page'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) } }),
}))
vi.mock('@/lib/api/endpoints', async importOriginal => ({
	...(await importOriginal<typeof import('@/lib/api/endpoints')>()),
	getGroup: vi.fn(),
	getShoppingHistory: vi.fn(),
}))

describe('group shopping history load state', () => {
	it('shows only the retryable error when loading fails with no returned sessions', async () => {
		vi.mocked(getGroup).mockResolvedValue({ data: { id: 'group-1', name: 'Groceries' }, error: null } as never)
		vi.mocked(getShoppingHistory).mockResolvedValue({ data: null, error: 'private backend detail' } as never)

		const page = await GroupHistoryPage({ params: Promise.resolve({ groupId: 'group-1' }) })
		const html = renderToStaticMarkup(page)

		expect(html).toContain('data-testid="group-history-load-error"')
		expect(html).toContain('We couldn’t load this group’s shopping history.')
		expect(html).toContain('href="/shopping-history/group-1"')
		expect(html).not.toContain('No shopping history yet')
		expect(html).not.toContain('private backend detail')
	})

	it('shows the empty state only after a successful empty response', async () => {
		vi.mocked(getGroup).mockResolvedValue({ data: { id: 'group-1', name: 'Groceries' }, error: null } as never)
		vi.mocked(getShoppingHistory).mockResolvedValue({ data: [], error: null } as never)

		const page = await GroupHistoryPage({ params: Promise.resolve({ groupId: 'group-1' }) })
		const html = renderToStaticMarkup(page)

		expect(html).toContain('No shopping history yet')
		expect(html).not.toContain('group-history-load-error')
	})
})
