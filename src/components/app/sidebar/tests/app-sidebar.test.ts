import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '@/components/app/sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

let pathname = '/dashboard'
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams() }))

const render = () => renderToStaticMarkup(createElement(SidebarProvider, null, createElement(AppSidebar)))

describe('AppSidebar', () => {
	it('is a floating panel that the top bar can hide completely', () => {
		const html = render()

		expect(html).toContain('data-variant="floating"')
		expect(html).toContain('data-slot="sidebar"')
		expect(html).toContain('group-data-[variant=floating]:rounded-[12px]')
	})

	it('opens with the brand, which links home', () => {
		const html = render()

		expect(html).toContain('data-testid="sidebar-brand"')
		expect(html).toContain('aria-label="Listys home"')
		expect(html).toContain('Shared shopping lists')
	})

	it('titles each group in plain semibold and lists its entries on one line, each with its icon', () => {
		const html = render()

		;['Shopping', 'Management', 'Settings'].forEach(title => expect(html).toContain(`>${title}</div>`))
		;['Dashboard', 'Shopping List Groups', 'Shopping History', 'Receipts', 'Profile', 'Account'].forEach(title =>
			expect(html).toContain(`<span>${title}</span>`),
		)
		const menu = html.slice(html.indexOf('data-sidebar="content"'), html.indexOf('data-sidebar="footer"'))
		expect(menu.match(/<svg/g)).toHaveLength(6)
		expect(menu).toContain('whitespace-nowrap')
		expect(menu).not.toContain('uppercase')
	})

	it('marks only the current page, on the secondary-button surface', () => {
		pathname = '/tickets'
		const html = render()
		const entry = (title: string) => html.match(new RegExp(`<a(?:[^>"]|"[^"]*")*?data-active="(true|false)"(?:[^>"]|"[^"]*")*>(?:<svg(?:(?!</svg>).)*</svg>)?<span>${title}</span>`))

		expect(entry('Receipts')?.[1]).toBe('true')
		expect(entry('Dashboard')?.[1]).toBe('false')
		expect(html).toContain('data-[active=true]:bg-[#E9ECF0]')
	})

	it('ends with the author credit and no session card when no trip is running', () => {
		const html = render()

		expect(html).toContain('Develop by')
		expect(html).not.toContain('data-testid="nav-active-session"')
	})
})
