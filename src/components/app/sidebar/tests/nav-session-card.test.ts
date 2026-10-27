import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NavSessionCard } from '@/components/app/nav-session-card'

describe('NavSessionCard', () => {
	it('links to the lists screen when other sessions are in progress', () => {
		const html = renderToStaticMarkup(createElement(NavSessionCard, {
			sessionId: 'session-1',
			name: 'Pantry',
			progress: null,
			otherCount: 2,
		}))

		expect(html).toContain('data-testid="nav-active-session-more"')
		expect(html).toContain('+2 more in progress')
		expect(html).toContain('href="/shopping-lists"')
	})
})
