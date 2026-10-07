import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AppBreadcrumb } from '@/components/app/app-breadcrumb'

const path = vi.hoisted(() => ({ value: '/dashboard' }))
vi.mock('next/navigation', () => ({ usePathname: () => path.value }))

describe('AppBreadcrumb', () => {
	it('shows "Section › Page" with the page marked as current, on desktop only', () => {
		path.value = '/dashboard'
		const html = renderToStaticMarkup(createElement(AppBreadcrumb))

		expect(html).toContain('aria-label="Breadcrumb"')
		expect(html).toContain('Shopping')
		expect(html).toMatch(/aria-current="page"[^>]*>Dashboard</)
		expect(html).toContain('lg:flex')
		expect(html).toContain('hidden')
	})

	it('renders nothing on a page that is not in the navigation', () => {
		path.value = '/shopping/s1'

		expect(renderToStaticMarkup(createElement(AppBreadcrumb))).toBe('')
	})
})
