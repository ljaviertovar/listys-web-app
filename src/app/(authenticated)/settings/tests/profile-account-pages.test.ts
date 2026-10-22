import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import AccountPage from '../account/page'
import ProfilePage from '../profile/page'

const fixture = vi.hoisted(() => ({
	user: {
		id: 'user-1',
		email: 'a.very.long.synthetic.email.address.for.mobile.reflow@example.test',
		created_at: '2026-10-01T12:00:00.000Z',
		last_sign_in_at: '2026-10-19T08:30:00.000Z',
		email_confirmed_at: '2026-10-01T12:00:00.000Z',
		user_metadata: { name: 'A long synthetic display name for narrow mobile screens', avatar_url: null },
		app_metadata: { provider: 'google' },
	},
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
	createClient: async () => ({ auth: { getUser: async () => ({ data: { user: fixture.user } }) } }),
}))

describe('profile and account details', () => {
	it('shows profile values as wrapping definition-list entries', async () => {
		const html = renderToStaticMarkup(await ProfilePage())

		expect(html).toContain('data-testid="profile-personal-details"')
		expect(html).toContain('Sign-in Provider')
		expect(html).toContain('Your profile photo comes from your sign-in provider.')
		expect(html).toContain(fixture.user.user_metadata.name)
		expect(html).toContain(fixture.user.email)
		expect(html).not.toContain('Supabase')
		expect(html).not.toContain('Manage authentication')
	})

	it('uses plain sign-in provider language and keeps long account values', async () => {
		const html = renderToStaticMarkup(await AccountPage())

		expect(html).toContain('data-testid="account-information-details"')
		expect(html).toContain('data-testid="account-security-details"')
		expect(html).toContain('Sign-in Provider')
		expect(html).toContain(fixture.user.email)
		expect(html).not.toContain('Supabase')
		expect(html).not.toContain('Manage authentication')
	})
})
