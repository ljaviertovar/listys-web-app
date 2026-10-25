import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { getBaseList } from '@/actions'
import EditBaseListPage from '../[baseListId]/edit/page'

vi.mock('next/navigation', () => ({ redirect: vi.fn(), useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/actions', () => ({ getBaseList: vi.fn() }))

const tables: string[] = []
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({
		auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
		from: (table: string) => {
			tables.push(table)
			const builder = {
				select: () => builder,
				eq: () => builder,
				maybeSingle: async () => ({ data: null }),
			}
			return builder
		},
	}),
}))
vi.mock('@/components/features/list-items', () => ({ AddItemSheet: () => null }))
vi.mock('@/components/features/sharing', () => ({ ShareListDialog: () => null }))
vi.mock('@/components/features/base-lists', () => ({
	BaseListItems: () => null,
	BaseListRealtimeListener: () => null,
	StartShoppingDialog: () => null,
}))

describe('base list editor page', () => {
	it('goes back to the lists screen and reads no group', async () => {
		vi.mocked(getBaseList).mockResolvedValue({
			data: { id: 'list-1', name: 'Pantry', user_id: 'user-1', group_id: 'g1', is_owner: true, items: [] },
			error: null,
		} as never)

		const html = renderToStaticMarkup(await EditBaseListPage({ params: Promise.resolve({ baseListId: 'list-1' }) }))

		expect(html).toContain('href="/shopping-lists"')
		expect(html).toContain('Back to Lists')
		expect(html.replace(/<[^>]*>/g, ' ')).not.toMatch(/group/i)
		expect(tables).not.toContain('groups')
	})
})
