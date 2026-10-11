import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Header } from '@/components/app/header'
import { SidebarProvider } from '@/components/ui/sidebar'

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard', useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

// The sidebar trigger in the bar reads the sidebar's open state, so the bar is always rendered inside its provider.
const render = () => renderToStaticMarkup(createElement(SidebarProvider, null, createElement(Header)))

describe('Header', () => {
	it('shows the logo on phones and the breadcrumb only from lg, with no menu button', () => {
		const html = render()

		expect(html).toMatch(/data-testid="header-logo"[^>]*class="[^"]*lg:hidden/)
		expect(html).toContain('data-testid="app-breadcrumb"')
		expect(html).toContain('hidden items-center gap-2 text-sm text-muted-foreground lg:flex')
		expect(html).not.toContain('mobile-nav-trigger')
		expect(html).not.toContain('Open menu')
	})

	it('puts the sidebar trigger and a hairline before the breadcrumb, from lg only', () => {
		const html = render()

		expect(html).toContain('data-slot="sidebar-trigger"')
		expect(html).toContain('Toggle Sidebar')
		expect(html.indexOf('sidebar-trigger')).toBeLessThan(html.indexOf('app-breadcrumb'))
		expect(html).toMatch(/<div class="hidden items-center gap-2 lg:flex"><button[^>]*data-slot="sidebar-trigger"/)
	})

	it('is 60px high on phones and 64px from lg, on the page ground from lg', () => {
		const html = render()

		expect(html).toContain('h-15')
		expect(html).toContain('lg:h-16')
		expect(html).toContain('lg:bg-[#F2F4F7]')
		expect(html).toContain('lg:border-b-0')
	})
})
