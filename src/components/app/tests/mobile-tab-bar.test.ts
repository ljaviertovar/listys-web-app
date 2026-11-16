import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { MobileTabBar, isListsSection } from '@/components/app/mobile-tab-bar'

let pathname = '/dashboard'
let activeSession: { id: string } | null = null
// zustand renders its initial state on the server, so the running trip is faked here.
vi.mock('@/stores/active-session', () => ({ useActiveSessionStore: (select: (s: { activeSession: unknown }) => unknown) => select({ activeSession }) }))
// The raised upload button opens the receipt dialog, which reads the App Router.
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const render = () => renderToStaticMarkup(createElement(MobileTabBar))

describe('MobileTabBar', () => {
	it('marks only the current section, including its nested pages', () => {
		pathname = '/dashboard'
		expect(render().match(/aria-current="page"/g)).toHaveLength(1)
		expect(render()).toMatch(/aria-current="page"[^>]*data-testid="mobile-tab-dashboard"/)

		pathname = '/tickets/t1'
		expect(render()).toMatch(/aria-current="page"[^>]*data-testid="mobile-tab-tickets"/)

		pathname = '/settings/profile'
		expect(render()).not.toContain('aria-current')
	})

	it('fills the current tab with the colour of its entity', () => {
		const pill = (path: string) => {
			pathname = path
			return render().match(/<a[^>]*aria-current="page"[^>]*class="([^"]*)"/)?.[1] ?? ''
		}
		expect(pill('/shopping-lists')).toContain('bg-entity-list text-entity-list-on')
		expect(pill('/tickets')).toContain('bg-entity-receipt text-entity-receipt-on')
		expect(pill('/trips')).toContain('bg-entity-trip text-entity-trip-on')
		expect(pill('/dashboard')).toContain('bg-border text-foreground')
	})

	it('labels the upload action and rings it only while a trip runs', () => {
		pathname = '/dashboard'
		activeSession = null
		let html = render()
		expect(html).toContain('>Upload</span>')
		expect(html).not.toContain('ring-card')
		expect(html).not.toContain('mobile-tab-trips-dot')

		activeSession = { id: 's1' }
		html = render()
		expect(html).toContain('ring-4 ring-card')
		expect(html).toContain('mobile-tab-trips-dot')
		expect(html).toContain('shopping in progress')
		activeSession = null
	})

	it('keeps Lists current while a list or a shopping session is open', () => {
		expect(isListsSection('/base-lists/l1/edit')).toBe(true)
		expect(isListsSection('/shopping/s1')).toBe(true)
		expect(isListsSection('/trips')).toBe(false)
		expect(isListsSection('/shopping-lists')).toBe(false)
	})
})
