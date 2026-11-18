import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppLoading, ErrorState, NotFoundState } from '@/components/app'

// Go Back reads the App Router, which does not exist while rendering to a string.
vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }))

afterEach(() => vi.unstubAllEnvs())

describe('ErrorState', () => {
	const render = (digest?: string) =>
		renderToStaticMarkup(createElement(ErrorState, { digest, reset: vi.fn(), exit: { href: '/dashboard', label: 'Go to Dashboard' }, testId: 'error' }))

	it('has no way to show the error, so nothing about it reaches the page, in development either', () => {
		vi.stubEnv('NODE_ENV', 'development')
		const error = Object.assign(new Error('Module [project]/node_modules/.pnpm/secret-package/index.js was instantiated'), { digest: '3814059922' })
		const html = renderToStaticMarkup(
			createElement(ErrorState, { digest: error.digest, reset: vi.fn(), exit: { href: '/', label: 'Go Home' }, fullScreen: true, testId: 'error' }),
		)
		expect(html).not.toContain(error.message)
		expect(html).not.toContain('node_modules')
		expect(html).toContain('3814059922')
	})

	it('shows the reference only when the error has one', () => {
		expect(render('3814059922')).toContain('data-testid="error-reference"')
		expect(render()).not.toContain('data-testid="error-reference"')
	})

	it('offers a retry and a way out', () => {
		const html = render()
		expect(html).toContain('data-testid="error-retry"')
		expect(html).toMatch(/href="\/dashboard"[^>]*>Go to Dashboard/)
	})
})

describe('NotFoundState', () => {
	it('leads to the exit and keeps Go Back as the second action', () => {
		const html = renderToStaticMarkup(createElement(NotFoundState, { exit: { href: '/dashboard', label: 'Go to Dashboard' }, testId: 'missing' }))
		expect(html.indexOf('data-testid="missing-exit"')).toBeLessThan(html.indexOf('data-testid="missing-back"'))
		expect(html).toContain('Page not found')
	})
})

describe('AppLoading', () => {
	it('is announced once as a status, with the slow line and its way out already in the markup', () => {
		const html = renderToStaticMarkup(createElement(AppLoading))
		expect(html).toContain('role="status"')
		expect(html).toContain('aria-label="Loading…"')
		expect(html).toContain('data-testid="app-loading-reload"')
		// The illustration says nothing a screen reader needs.
		expect(html).toMatch(/aria-hidden="true"[^>]*data-testid="app-loading-paper"/)
	})
})
