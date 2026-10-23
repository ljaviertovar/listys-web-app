import { isValidElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getActiveShoppingSession, getBaseLists, getGroups, getShoppingHistory, getTickets } from '@/lib/api/endpoints'
import { ensureDefaultPantry } from '@/lib/server/services/default-pantry.service'

import { DashboardContent } from '../dashboard-content'
import { DashboardLoadError } from '../dashboard-load-error'
import { DashboardView } from '../dashboard-view'

vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-1', email: 'maria@example.com' } } }) } }),
}))
vi.mock('@/lib/server/services/default-pantry.service', () => ({ ensureDefaultPantry: vi.fn() }))
vi.mock('@/lib/api/endpoints', async importOriginal => ({
	...(await importOriginal<typeof import('@/lib/api/endpoints')>()),
	getGroups: vi.fn(),
	getBaseLists: vi.fn(),
	getTickets: vi.fn(),
	getShoppingHistory: vi.fn(),
	getActiveShoppingSession: vi.fn(),
}))

const ok = (data: unknown) => ({ data, error: null }) as never

function mockReads(baseLists: unknown[] = []) {
	vi.mocked(getGroups).mockResolvedValue(ok([]))
	vi.mocked(getBaseLists).mockResolvedValue(ok(baseLists))
	vi.mocked(getTickets).mockResolvedValue(ok([]))
	vi.mocked(getShoppingHistory).mockResolvedValue(ok([]))
	vi.mocked(getActiveShoppingSession).mockResolvedValue(ok(null))
}

describe('DashboardContent', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(ensureDefaultPantry).mockResolvedValue(true)
	})

	it('provisions the default Pantry before it reads the lists', async () => {
		mockReads([{ id: 'list-1', name: 'Pantry', group_id: 'group-1', items: [{ count: 0 }] }])

		await DashboardContent()

		const [provisionOrder] = vi.mocked(ensureDefaultPantry).mock.invocationCallOrder
		const [readOrder] = vi.mocked(getBaseLists).mock.invocationCallOrder
		expect(provisionOrder).toBeLessThan(readOrder)
	})

	it('shows the lists that exist when provisioning created nothing or failed', async () => {
		vi.mocked(ensureDefaultPantry).mockResolvedValue(false)
		mockReads([{ id: 'list-1', name: 'Pantry', group_id: 'group-1', items: [{ count: 0 }] }])

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

	it('keeps the load error for a failed read, not an empty account', async () => {
		mockReads()
		vi.mocked(getBaseLists).mockResolvedValue({ data: null, error: 'boom' } as never)

		const element = await DashboardContent()

		expect((element as { type: unknown }).type).toBe(DashboardLoadError)
	})
})
