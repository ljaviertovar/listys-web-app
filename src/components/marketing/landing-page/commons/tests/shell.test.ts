import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Shell } from '../shell'

describe('Shell', () => {
	it('forwards the test identifier to the wrapper element', () => {
		const html = renderToStaticMarkup(
			createElement(Shell, { 'data-testid': 'hero-content-shell' }, 'Hero content'),
		)

		expect(html).toContain('<div')
		expect(html).toContain('data-testid="hero-content-shell"')
		expect(html).toContain('Hero content')
	})
})
