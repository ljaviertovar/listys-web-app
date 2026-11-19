import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { TicketSpendingCard } from '../ticket-spending-card'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/lib/api/endpoints', () => ({ updateTicketSpending: vi.fn() }))

const render = (props: { included: boolean; hasTotal: boolean }) =>
	renderToStaticMarkup(createElement(TicketSpendingCard, { ticketId: 't1', ...props }))

describe('TicketSpendingCard', () => {
	it('says a counted receipt is counted, once, with no second badge', () => {
		const html = render({ included: true, hasTotal: true })
		expect(html).toContain('Count in spending')
		expect(html).toContain('Counted in This Month and All Time.')
		expect(html).not.toContain('Include in spending')
		expect(html).not.toContain('receipt-spending-badge')
		expect(html).toMatch(/role="switch"[^>]*aria-checked="true"/)
	})

	it('says a receipt left out is left out', () => {
		const html = render({ included: false, hasTotal: true })
		expect(html).toContain('Left out of This Month and All Time.')
		expect(html).not.toContain('Counted in')
		expect(html).toMatch(/role="switch"[^>]*aria-checked="false"/)
	})

	it('explains why the switch is off limits without a recorded total', () => {
		const html = render({ included: false, hasTotal: false })
		expect(html).toContain('Needs a recorded total to count.')
		expect(html).toMatch(/role="switch"[^>]*disabled/)
	})

	it('keeps the switch tied to its title and to the line that says the state', () => {
		const html = render({ included: true, hasTotal: true })
		const id = html.match(/<label for="([^"]+)"/)?.[1]
		expect(id).toBeTruthy()
		expect(html).toContain(`id="${id}"`)
		expect(html).toContain(`aria-describedby="${id}-help"`)
		expect(html).toContain(`id="${id}-help"`)
	})
})
