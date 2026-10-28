import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { MobileTabBar, isListsSection } from '@/components/app/mobile-tab-bar'

let pathname = '/dashboard'
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

	it('keeps Lists current while a list or a shopping session is open', () => {
		expect(isListsSection('/base-lists/l1/edit')).toBe(true)
		expect(isListsSection('/shopping/s1')).toBe(true)
		expect(isListsSection('/shopping-history')).toBe(false)
		expect(isListsSection('/shopping-lists')).toBe(false)
	})
})
