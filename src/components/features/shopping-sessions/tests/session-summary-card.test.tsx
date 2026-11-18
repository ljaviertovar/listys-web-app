import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { SessionSummaryCard } from '../session-summary-card'

it('shows an available zero accumulator while retaining progress', () => {
	const html = renderToStaticMarkup(createElement(SessionSummaryCard, { mode: 'active', checked: 2, total: 5, estimate: { total: 0, itemCount: 2, pricedCount: 0 } }))
	expect(html).toContain('$0.00')
	expect(html).toContain('No known prices for the checked items')
	expect(html).toContain('aria-valuenow="40"')
	expect(html).toContain('aria-valuetext="2 of 5 items"')
})

it('says what the estimate is based on only once, and what is missing when prices are', () => {
	const html = renderToStaticMarkup(createElement(SessionSummaryCard, { mode: 'active', checked: 3, total: 5, estimate: { total: 9, itemCount: 3, pricedCount: 2 } }))
	expect(html).toContain('Based on 2 of 3 checked items')
	expect(html).toContain('1 without a price yet')
	expect(html).not.toContain('Collected')
})

it('keeps progress without an estimate when no prices are available', () => {
	const html = renderToStaticMarkup(createElement(SessionSummaryCard, { mode: 'active', checked: 0, total: 5 }))
	expect(html).toContain('role="progressbar"')
	expect(html).toContain('Still to collect')
	expect(html).not.toContain('$0.00')
})
