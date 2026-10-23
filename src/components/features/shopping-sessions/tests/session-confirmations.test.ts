import { createElement } from 'react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CancelSessionSheet } from '../cancel-session-sheet'
import { CompleteSessionSheet } from '../complete-session-sheet'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/components/commons', async () => {
	const React = await import('react')
	type Props = {
		title: string
		description?: ReactNode
		consequence?: ReactNode
		cancelLabel: string
		confirmLabel: string
		loadingLabel: string
		loading?: boolean
		testId: string
		children?: ReactNode
	}

	return {
		ConfirmSheet: (props: Props) =>
			React.createElement(
				'section',
				{ 'data-testid': props.testId, 'data-loading-label': props.loadingLabel, 'data-loading': props.loading ?? false },
				React.createElement('h2', null, props.title),
				React.createElement('div', null, props.description ?? props.consequence),
				React.createElement('button', null, props.cancelLabel),
				React.createElement('button', null, props.loading ? props.loadingLabel : props.confirmLabel),
				props.children,
			),
	}
})

const renderComplete = (checked: number, total: number) =>
	renderToStaticMarkup(
		createElement(CompleteSessionSheet, {
			sessionId: 'synthetic-session',
			checked,
			total,
			open: true,
			onOpenChange: () => {},
		}),
	)

describe('shopping session confirmations', () => {
	it('states the unchecked count and makes continuing shopping the clear rejection', () => {
		const html = renderComplete(1, 4)

		expect(html).toMatch(/<b[^>]*>3<\/b> items are still unchecked/)
		expect(html).toContain('save the items you collected to your history and your list? Unchecked items stay in your list.')
		expect(html).toContain('Continue Shopping')
		expect(html).toContain('Complete Shopping')
		expect(html).toContain('data-loading-label="Completing Shopping…"')
	})

	it('uses singular grammar when one item is unchecked', () => {
		expect(renderComplete(2, 3)).toMatch(/<b[^>]*>1<\/b> item is still unchecked/)
	})

	it('shows the ready state and says the trip updates the history and the list', () => {
		const html = renderComplete(4, 4)

		expect(html).toContain('Ready to Complete Shopping?')
		expect(html).toContain('All items are checked. Complete shopping to save this trip to your history and update your list.')
	})

	it.each([[4, 4], [1, 4]])('offers no way to skip updating the base list (%i of %i checked)', (checked, total) => {
		const html = renderComplete(checked, total)

		expect(html).not.toContain('Update the Base List')
		expect(html).not.toContain('complete-session-sync')
		expect(html).not.toContain('role="checkbox"')
		expect(html).not.toContain('aria-checked')
	})

	it('explains that cancellation discards the session and keeps the non-destructive choice clear', () => {
		const html = renderToStaticMarkup(createElement(CancelSessionSheet, { sessionId: 'synthetic-session', open: true, onOpenChange: () => {} }))

		expect(html).toContain('This discards the session entirely.')
		expect(html).toContain('It won’t be saved to your history and it can’t be undone.')
		expect(html).toContain('Keep Shopping')
		expect(html).toContain('Cancel Shopping')
		expect(html).toContain('data-loading-label="Cancelling…"')
	})
})
