import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import MobileNavDrawer from '@/components/app/mobile-nav-drawer'

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }))

describe('MobileNavDrawer', () => {
	it('exposes an accessible menu button and keeps the navigation closed until it is opened', () => {
		const html = renderToStaticMarkup(createElement(MobileNavDrawer))

		expect(html).toContain('data-testid="mobile-nav-trigger"')
		expect(html).toContain('aria-label="Open menu"')
		expect(html).not.toContain('mobile-nav-drawer"')
	})
})
