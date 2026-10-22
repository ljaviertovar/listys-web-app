import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import AuthButtons from '../auth-buttons'
import GoogleButtonSignin from '../google-button-signin'

vi.mock('@/lib/supabase/client', () => ({
	createClient: () => ({ auth: { signInWithOAuth: vi.fn() } }),
}))

describe('authentication component identifiers', () => {
	it('identifies the public header actions while they are loading', () => {
		const html = renderToStaticMarkup(createElement(AuthButtons))

		expect(html).toContain('data-testid="site-auth-actions"')
	})

	it('uses a contextual id for the Google sign-in action and accepts an override', () => {
		const signIn = renderToStaticMarkup(createElement(GoogleButtonSignin, { typeSubmit: 'signin' }))
		const custom = renderToStaticMarkup(createElement(GoogleButtonSignin, { typeSubmit: 'signup', testId: 'signup-provider-action' }))

		expect(signIn).toContain('data-testid="google-signin-button"')
		expect(custom).toContain('data-testid="signup-provider-action"')
	})
})
