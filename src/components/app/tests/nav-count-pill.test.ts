import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NavCountPill } from '@/components/app/nav-count-pill'

describe('NavCountPill', () => {
	it('shows the number with a spoken label, neutral for lists', () => {
		const html = renderToStaticMarkup(createElement(NavCountPill, { testId: 'pill', count: { value: 2, tone: 'neutral', label: '2 lists' } }))

		expect(html).toContain('data-testid="pill"')
		expect(html).toContain('aria-label="2 lists"')
		expect(html).toContain('bg-slate-100')
		expect(html).toContain('>2<')
	})

	it('is amber when something is waiting', () => {
		const html = renderToStaticMarkup(createElement(NavCountPill, { testId: 'pill', count: { value: 1, tone: 'waiting', label: '1 receipt waiting' } }))

		expect(html).toContain('bg-amber-100')
	})
})
