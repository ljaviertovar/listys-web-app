import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MobileNavPanel } from '@/components/app/mobile-nav-panel'

const store = vi.hoisted(() => ({ session: null as { id: string; name: string } | null }))
const summary = vi.hoisted(() => ({
	value: {
		user: { name: 'Javier Tovar', email: 'javier.tovar@example.com', initials: 'JT', avatarUrl: null },
		groupsCount: 2,
		receiptsWaiting: 1,
		progress: { checked: 3, total: 19 },
	} as Record<string, unknown>,
}))

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard', useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
// Server rendering reads a store's initial state, so the store is replaced by a stand-in the tests can set.
vi.mock('@/stores/active-session', () => ({
	default: (select: (state: unknown) => unknown) => select({ activeSession: store.session }),
}))
vi.mock('@/components/app/hooks/use-nav-summary', () => ({ useNavSummary: () => summary.value }))

const render = () => renderToStaticMarkup(createElement(MobileNavPanel, { open: true, onNavigate: () => {} }))

afterEach(() => {
	store.session = null
})

describe('MobileNavPanel', () => {
	it('lists the sidebar sections in order and marks the current page', () => {
		const html = render()

		expect(html.indexOf('Shopping<')).toBeLessThan(html.indexOf('Management<'))
		expect(html.indexOf('Management<')).toBeLessThan(html.indexOf('Settings<'))
		expect(html).toContain('aria-current="page"')
		expect(html).toContain('uppercase')
	})

	it('shows how many groups there are and how many receipts still wait for a list, the latter in amber', () => {
		const html = render()

		expect(html).toContain('aria-label="2 groups"')
		expect(html).toContain('aria-label="1 receipt waiting"')
		expect(html).toMatch(/aria-label="1 receipt waiting"[^>]*class="[^"]*bg-amber-100/)
	})

	it('shows no count when there is nothing to count', () => {
		summary.value = { ...summary.value, groupsCount: 0, receiptsWaiting: null }

		expect(render()).not.toContain('mobile-nav-count')
		summary.value = { ...summary.value, groupsCount: 2, receiptsWaiting: 1 }
	})

	it('puts the running session at the foot with its name, progress and a link back in', () => {
		store.session = { id: 's1', name: 'Items for Dinner' }
		const html = render()

		expect(html).toContain('data-testid="nav-active-session"')
		expect(html).toContain('href="/shopping/s1"')
		expect(html).toContain('Shopping now')
		expect(html).toContain('Items for Dinner')
		expect(html).toContain('3/19')
		expect(html).toContain('aria-valuenow="16"')
	})

	it('leaves the session card out when nothing is running', () => {
		expect(render()).not.toContain('nav-active-session')
	})

	it('shows the account with a sign-out button, then the author credit', () => {
		const html = render()

		expect(html).toContain('Javier Tovar')
		expect(html).toContain('javier.tovar@example.com')
		expect(html).toContain('>JT<')
		expect(html).toContain('aria-label="Sign out"')
		expect(html.indexOf('mobile-nav-account')).toBeLessThan(html.indexOf('Develop by'))
	})

	it('keeps showing the name of a session whose progress has not loaded yet', () => {
		summary.value = { ...summary.value, progress: null }
		store.session = { id: 's1', name: 'Items for Dinner' }
		const html = render()

		expect(html).toContain('Items for Dinner')
		expect(html).not.toContain('3/19')
	})
})
