import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { MobileTabBar } from '@/components/app/mobile-tab-bar'

let pathname = '/dashboard'
// The raised upload button opens the receipt dialog, which reads the App Router.
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const render = () => renderToStaticMarkup(createElement(MobileTabBar))

describe('MobileTabBar', () => {
	it('only exists on phones and names itself as the main navigation', () => {
		const html = render()

		expect(html).toContain('data-testid="mobile-tab-bar"')
		expect(html).toContain('aria-label="Main"')
		expect(html).toContain('lg:hidden')
		expect(html).toContain('fixed inset-x-0 bottom-0')
		expect(html).toContain('min-h-11 flex-col items-center justify-start gap-1')
		expect(html).toContain('-mt-5 size-12')
	})

	it('links the four destinations in design order, with the upload action raised in the middle', () => {
		const html = render()
		const order = ['mobile-tab-dashboard', 'mobile-tab-shopping-lists', 'mobile-tab-upload', 'mobile-tab-tickets', 'mobile-tab-shopping-history']

		order.forEach(testId => expect(html).toContain(`data-testid="${testId}"`))
		expect(order.map(testId => html.indexOf(testId))).toEqual([...order.map(testId => html.indexOf(testId))].sort((a, b) => a - b))
		expect(html).toContain('href="/shopping-lists"')
		expect(html).toContain('href="/tickets"')
		expect(html).toContain('href="/shopping-history"')
		expect(html).toContain('aria-label="Upload a receipt"')
	})

	it('marks only the current section, including its nested pages', () => {
		pathname = '/dashboard'
		expect(render().match(/aria-current="page"/g)).toHaveLength(1)
		expect(render()).toMatch(/aria-current="page"[^>]*data-testid="mobile-tab-dashboard"/)

		pathname = '/tickets/t1'
		expect(render()).toMatch(/aria-current="page"[^>]*data-testid="mobile-tab-tickets"/)
		expect(render()).not.toMatch(/aria-current="page"[^>]*data-testid="mobile-tab-dashboard"/)
	})

	it('puts the current tab on the secondary-button surface and leaves the others flat', () => {
		pathname = '/dashboard'
		const html = render()
		const tab = (id: string) => html.match(new RegExp(`<a[^>]*data-testid="mobile-tab-${id}"[^>]*>`))?.[0] ?? ''

		expect(tab('dashboard')).toContain('bg-[#E9ECF0]')
		expect(tab('tickets')).not.toContain('bg-[#E9ECF0]')
	})

	it('marks nothing as current on a page that is not one of the four', () => {
		pathname = '/settings/profile'

		expect(render()).not.toContain('aria-current')
	})
})
