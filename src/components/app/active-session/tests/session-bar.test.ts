import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { isSessionScreen } from '@/components/app/active-session/active-session-bar'
import { SessionBar } from '@/components/app/active-session/session-bar'

describe('isSessionScreen', () => {
	it('is true only on the screen of that session', () => {
		expect(isSessionScreen('/shopping/s1', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s1/anything', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s2', 's1')).toBe(false)
		expect(isSessionScreen('/shopping-lists', 's1')).toBe(false)
		expect(isSessionScreen('/shopping/s10', 's1')).toBe(false)
	})
})

describe('SessionBar', () => {
	it('links to the lists screen when more sessions are active', () => {
		const html = renderToStaticMarkup(createElement(SessionBar, {
			id: 's1',
			name: 'Pantry',
			progress: null,
			otherCount: 2,
		}))

		expect(html).toContain('data-testid="active-session-more-link"')
		expect(html).toContain('+2 more')
		expect(html).toContain('href="/shopping-lists"')
	})
})
