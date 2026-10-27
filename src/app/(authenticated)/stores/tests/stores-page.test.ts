import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { getStores } from '@/lib/api/endpoints'
import StoresPage from '../page'

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
	useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
	usePathname: () => '/stores',
}))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) } }),
}))
vi.mock('@/lib/api/endpoints', async importOriginal => ({
	...(await importOriginal<typeof import('@/lib/api/endpoints')>()),
	getStores: vi.fn(),
}))

const store = (id: string, name: string, receipt_count: number) => ({ id, name, receipt_count, created_at: '', updated_at: '' })
const render = async () => renderToStaticMarkup(await StoresPage())
const text = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')

beforeEach(() => vi.clearAllMocks())

describe('My Stores page', () => {
	it('lists the stores with their receipt counts', async () => {
		vi.mocked(getStores).mockResolvedValue({ data: [store('s1', 'No Frills', 3), store('s2', 'Metro', 1), store('s3', 'Dollarama', 0)] } as never)

		const page = text(await render())

		expect(page).toContain('My Stores')
		expect(page).toContain('3 stores')
		expect(page).toContain('No Frills')
		expect(page).toContain('3 receipts')
		expect(page).toContain('1 receipt')
		expect(page).toContain('No receipts yet')
	})

	it('explains how stores appear when there are none, with a way to the receipts', async () => {
		vi.mocked(getStores).mockResolvedValue({ data: [] } as never)

		const html = await render()

		expect(html).toContain('data-testid="stores-empty"')
		expect(text(html)).toContain('A store is added when you confirm or save it on a receipt.')
		expect(html).toContain('href="/tickets"')
		expect(html).not.toContain('data-testid="stores-list"')
	})

	it('shows a retryable error, not an empty state, when the stores cannot be loaded', async () => {
		vi.mocked(getStores).mockResolvedValue({ data: undefined, error: 'private backend detail' } as never)

		const html = await render()

		expect(html).toContain('data-testid="stores-load-error"')
		expect(html).not.toContain('data-testid="stores-empty"')
		expect(html).not.toContain('private backend detail')
	})
})
