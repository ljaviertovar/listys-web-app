import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SessionEstimate } from '@/components/features/shopping-sessions'

const render = (total: number, pricedCount: number, itemCount: number) =>
	renderToStaticMarkup(createElement(SessionEstimate, { total, pricedCount, itemCount }))

describe('SessionEstimate', () => {
	it('labels the amount as an estimate and says how many items it covers', () => {
		const html = render(27.4, 3, 12)

		expect(html).toContain('data-testid="session-estimate-card"')
		expect(html).toContain('Estimated total')
		expect(html).toContain('$27.40')
		expect(html).toMatch(/Based on <b[^>]*>3<\/b> of\s*<b[^>]*>12<\/b> items with a known price/)
	})

	it('uses the singular for a one-item trip', () => {
		expect(render(3.49, 1, 1)).toMatch(/<b[^>]*>1<\/b> item with a known price/)
	})

	it('never claims what was paid', () => {
		const html = render(27.4, 3, 12)

		expect(html).not.toMatch(/\bpaid\b|\btotal paid\b|\bspent\b/i)
	})

	it('draws nothing when no item has a known price', () => {
		expect(render(0, 0, 12)).toBe('')
	})
})
