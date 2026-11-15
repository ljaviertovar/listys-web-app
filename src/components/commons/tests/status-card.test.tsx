import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'

import { StatusCard } from '../status-card'

it('preserves the caller announcement mode, focus destination and optional action', () => {
	const props = { testId: 'receipt-status', tone: 'info' as const, title: 'Receipt state', description: 'Details', headingId: 'receipt-state-title' }
	const status = renderToStaticMarkup(createElement(StatusCard, props))
	expect(status).toContain('role="status"')
	expect(status).toContain('aria-live="polite"')
	expect(status).toContain('id="receipt-state-title" tabindex="-1"')
	const alert = renderToStaticMarkup(createElement(StatusCard, { ...props, role: 'alert', actions: createElement('button', { 'aria-label': 'Retry fixture' }) }))
	expect(alert).toContain('role="alert"')
	expect(alert).not.toContain('aria-live="polite"')
	expect(alert).toContain('aria-label="Retry fixture"')
})
