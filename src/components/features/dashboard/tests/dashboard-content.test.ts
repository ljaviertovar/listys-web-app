import { isValidElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBaseLists, getLikelyNeededItems, getShoppingHistory, getStores, getTickets } from '@/lib/api/endpoints'
import { ensureDefaultPantry } from '@/lib/server/services/default-pantry.service'

import { DashboardContent } from '../dashboard-content'
import { DashboardLoadError } from '../dashboard-load-error'
import { DashboardView } from '../dashboard-view'

let activeSessionRows: unknown[] = []
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({
		auth: { getUser: async () => ({ data: { user: { id: 'user-1', email: 'maria@example.com' } } }) },
		from: () => {
			const query = {
				select: () => query,
				eq: () => query,
				order: () => query,
				limit: async () => ({ data: activeSessionRows, error: null }),
			}
			return query
		},
	}),
}))
vi.mock('@/lib/server/services/default-pantry.service', () => ({ ensureDefaultPantry: vi.fn() }))
vi.mock('@/lib/api/endpoints', async importOriginal => ({
	...(await importOriginal<typeof import('@/lib/api/endpoints')>()),
	getBaseLists: vi.fn(),
	getTickets: vi.fn(),
	getShoppingHistory: vi.fn(),
	getLikelyNeededItems: vi.fn(),
	getStores: vi.fn(),
}))

const ok = (data: unknown) => ({ data, error: null }) as never

function mockReads(baseLists: unknown[] = []) {
	vi.mocked(getBaseLists).mockResolvedValue(ok(baseLists))
	vi.mocked(getTickets).mockResolvedValue(ok([]))
	vi.mocked(getShoppingHistory).mockResolvedValue(ok([]))
	vi.mocked(getLikelyNeededItems).mockResolvedValue({ data: [], meta: { limit: 5, has_history: false } } as never)
	vi.mocked(getStores).mockResolvedValue(ok([]))
	activeSessionRows = []
}

describe('DashboardContent', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		activeSessionRows = []
		vi.mocked(ensureDefaultPantry).mockResolvedValue(true)
	})

	it('provisions the default Pantry before it reads the lists', async () => {
		mockReads([{ id: 'list-1', name: 'Pantry', items: [{ count: 0 }] }])

		await DashboardContent()

		const [provisionOrder] = vi.mocked(ensureDefaultPantry).mock.invocationCallOrder
		const [readOrder] = vi.mocked(getBaseLists).mock.invocationCallOrder
		expect(provisionOrder).toBeLessThan(readOrder)
	})

	it('shows the lists that exist when provisioning created nothing or failed', async () => {
		vi.mocked(ensureDefaultPantry).mockResolvedValue(false)
		mockReads([{ id: 'list-1', name: 'Pantry', items: [{ count: 0 }] }])

		const element = await DashboardContent()

		expect(isValidElement(element)).toBe(true)
		expect((element as { type: unknown }).type).toBe(DashboardView)
		expect((element as { props: { hasLists: boolean } }).props.hasLists).toBe(true)
	})

	it('still renders the empty dashboard when provisioning failed and there are no lists', async () => {
		vi.mocked(ensureDefaultPantry).mockResolvedValue(false)
		mockReads([])

		const element = await DashboardContent()

		expect((element as { type: unknown }).type).toBe(DashboardView)
		expect((element as { props: { hasLists: boolean } }).props.hasLists).toBe(false)
	})

	it('loads every active session and keeps the newest as the dashboard hero', async () => {
		mockReads([{ id: 'list-1', name: 'Pantry', items: [{ count: 2 }] }])
		activeSessionRows = [
			{ id: 'session-new', name: 'New trip', user_id: 'user-1', base_list_id: 'list-1', items: [], base_list: { name: 'Pantry', collaborators: [] } },
			{ id: 'session-old', name: 'Old trip', user_id: 'user-1', base_list_id: 'list-2', items: [], base_list: { name: 'Weekly', collaborators: [] } },
		]

		const element = await DashboardContent()
		const { model } = (element as { props: { model: { activeSession?: { id: string } | null; otherSessionCount: number; activeSessionIds: Record<string, string> } } }).props

		expect(model.activeSession?.id).toBe('session-new')
		expect(model.otherSessionCount).toBe(1)
		expect(model.activeSessionIds).toEqual({ 'list-1': 'session-new', 'list-2': 'session-old' })
	})

	it('keeps the load error for a failed read, not an empty account', async () => {
		mockReads()
		vi.mocked(getBaseLists).mockResolvedValue({ data: null, error: 'boom' } as never)

		const element = await DashboardContent()

		expect((element as { type: unknown }).type).toBe(DashboardLoadError)
	})

	it('keeps the load error when likely-needed or store data fails', async () => {
		mockReads()
		vi.mocked(getLikelyNeededItems).mockResolvedValue({ error: 'failed' } as never)
		expect((await DashboardContent() as { type: unknown }).type).toBe(DashboardLoadError)
		mockReads()
		vi.mocked(getStores).mockResolvedValue({ error: 'failed' } as never)
		expect((await DashboardContent() as { type: unknown }).type).toBe(DashboardLoadError)
	})
})
