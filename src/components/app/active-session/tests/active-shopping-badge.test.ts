import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ActiveShoppingBadge } from '@/components/app/active-session/active-shopping-badge'

describe('ActiveShoppingBadge', () => {
	it('names the state in words and draws a static dot', () => {
		const html = renderToStaticMarkup(createElement(ActiveShoppingBadge))

		expect(html).toContain('data-testid="active-shopping-badge"')
		expect(html).toContain('Shopping')
		expect(html).toContain('bg-green-600')
		expect(html).not.toContain('animate-ping')
	})

	it('switches to light-on-dark colours for photo and ink surfaces', () => {
		const html = renderToStaticMarkup(createElement(ActiveShoppingBadge, { tone: 'on-dark' }))

		expect(html).toContain('bg-white/15')
		expect(html).toContain('bg-green-400')
	})
})
