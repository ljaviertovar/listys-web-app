import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { RetryableError } from '@/components/commons/retryable-error'

vi.mock('next/link', () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => createElement('a', { href }, children) }))

describe('RetryableError', () => {
	it('announces a safe load message and links to the current page for retry', () => {
		const html = renderToStaticMarkup(
			createElement(RetryableError, { message: 'We couldn’t load your shopping history.', href: '/shopping-history', testId: 'history-error' }),
		)

		expect(html).toContain('data-testid="history-error"')
		expect(html).toContain('role="alert"')
		expect(html).toContain('We couldn’t load your shopping history.')
		expect(html).toContain('href="/shopping-history"')
		expect(html).toContain('Try again')
	})
})
