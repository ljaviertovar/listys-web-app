import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { SessionSummaryCard } from '../session-summary-card'

it('shows an available zero accumulator while retaining progress', () => {
	const html = renderToStaticMarkup(createElement(SessionSummaryCard, { mode: 'active', checked: 2, total: 5, estimate: { total: 0, itemCount: 2, pricedCount: 0 } }))
	expect(html).toContain('$0.00')
	expect(html).toContain('2 checked')
	expect(html).toContain('40%')
})

it('keeps progress without an estimate when no prices are available', () => {
	const html = renderToStaticMarkup(createElement(SessionSummaryCard, { mode: 'active', checked: 0, total: 5 }))
	expect(html).toContain('role="progressbar"')
	expect(html).not.toContain('$0.00')
})
