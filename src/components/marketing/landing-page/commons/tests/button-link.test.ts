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

	it('uses the shared primary action height on mobile and from md up', () => {
		const html = renderToStaticMarkup(
			createElement(ButtonLink, { href: '/get-started', size: 'sm' }, 'Get started'),
		)

		expect(html).toContain('h-10')
		expect(html).toContain('md:h-11')
		expect(html).not.toContain('max-sm:min-h-11')
	})

	it('reserves the highlight layer for the hero CTA', () => {
		const standard = renderToStaticMarkup(createElement(ButtonLink, { href: '/get-started', size: 'xl' }, 'Get started'))
		const hero = renderToStaticMarkup(createElement(ButtonLink, { href: '/', size: 'xl', variant: 'hero' }, 'Start shopping'))

		expect(standard).not.toContain('from-white/20')
		expect(standard).not.toContain('shadow-glow')
		expect(hero).toContain('from-white/20')
		expect(hero).toContain('shadow-glow')
	})
})
