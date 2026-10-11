import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { UserNav } from '@/components/features/auth/user-nav'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const user = { email: 'javier.tovar@example.com', user_metadata: { full_name: 'Javier Tovar' } }
const render = () => renderToStaticMarkup(createElement(UserNav, { user }))

// The menu itself is portalled and only exists once opened in a browser; its geometry is checked there.
describe('UserNav trigger', () => {
	it('is an accessible 44px circle on phones that turns into a pill with name and email from lg', () => {
		const html = render()

		expect(html).toContain('data-testid="user-nav-trigger"')
		expect(html).toContain('aria-label="Account menu"')
		expect(html).toContain('aria-haspopup="menu"')
		expect(html).toContain('size-11')
		expect(html).toContain('lg:w-auto')
		expect(html).toMatch(/hidden flex-col[^"]*lg:flex">.*Javier Tovar/)
		expect(html).toContain('javier.tovar@example.com')
	})

	it('shows the initials and rests on the secondary surface while the menu is open', () => {
		const html = render()

		expect(html).toContain('>JT<')
		expect(html).toContain('data-[state=open]:bg-[#E9ECF0]')
		expect(html).toContain('aria-expanded="false"')
	})
})
