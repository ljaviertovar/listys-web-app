import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AuthModeSwitch } from '../auth-mode-switch'
import { AuthScreen } from '../auth-screen'

// The form reads the App Router and creates the Supabase browser client; their flows are covered in the browser.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))

const screen = (mode: 'signin' | 'signup') => renderToStaticMarkup(createElement(AuthScreen, { mode }))

describe('AuthModeSwitch', () => {
	it('marks only the current screen and links both', () => {
		const html = renderToStaticMarkup(createElement(AuthModeSwitch, { mode: 'signup' }))
		expect(html).toContain('href="/auth/signin"')
		expect(html).toContain('href="/auth/signup"')
		expect(html.match(/aria-current="page"/g)).toHaveLength(1)
		expect(html).toMatch(/aria-current="page"[^>]*>Create Account/)
	})
})

describe('AuthScreen', () => {
	it('sign in: welcomes back, offers Google and email, and invites to register from the photo panel', () => {
		const html = screen('signin')
		expect(html).toContain('data-testid="auth-screen"')
		expect(html).toContain('Welcome back')
		expect(html).toContain('Sign In with Google')
		expect(html).toContain('Sign In with Email')
		expect(html).not.toContain('Forgot Password?')
		expect(html).toContain('data-testid="auth-hero-cta"')
		expect(html).toContain('Create Your Account')
		expect(html).not.toContain('Must be at least 6 characters long')
		expect(html).toContain('autoComplete="current-password"')
		expect(html).toContain('aria-label="Show password"')
		expect(html).toContain('aria-pressed="false"')
	})

	it('sign up: asks for a 6 character password and lists what the account gives instead of a button', () => {
		const html = screen('signup')
		expect(html).toContain('Create account')
		expect(html).toContain('Sign Up with Google')
		expect(html).toContain('Create Account with Email')
		expect(html).toContain('Must be at least 6 characters long')
		expect(html).toContain('Share lists with your household')
		expect(html).toContain('autoComplete="new-password"')
		expect(html).not.toContain('data-testid="auth-hero-cta"')
		expect(html).not.toContain('Forgot Password?')
	})

	it('renders the form once and the photo once, whatever the breakpoint', () => {
		for (const mode of ['signin', 'signup'] as const) {
			const html = screen(mode)
			expect(html.match(/data-testid="auth-form"/g)).toHaveLength(1)
			expect(html.match(/data-testid="auth-hero"/g)).toHaveLength(1)
			expect(html.match(/<img/g)).toHaveLength(1)
		}
	})

	it('keeps placeholder legal destinations out and links the way back home', () => {
		const html = screen('signin')
		expect(html).not.toContain('href="/terms"')
		expect(html).not.toContain('href="/privacy"')
		expect(html).toContain('data-testid="auth-back-link"')
	})
})
