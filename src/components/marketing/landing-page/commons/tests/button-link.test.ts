import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ButtonLink } from '../button-link'

describe('ButtonLink', () => {
	it('forwards the accessible test identifier to the link element', () => {
		const html = renderToStaticMarkup(
			createElement(ButtonLink, { href: '/get-started', 'data-testid': 'landing-signup-link' }, 'Get started'),
		)

		expect(html).toContain('<a')
		expect(html).toContain('href="/get-started"')
		expect(html).toContain('data-testid="landing-signup-link"')
		expect(html).toContain('Get started')
	})
})
