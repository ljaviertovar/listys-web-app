import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Rows } from '../list-rows'

describe('Rows', () => {
	it('forwards the test identifier to the list element', () => {
		const html = renderToStaticMarkup(
			createElement(Rows, { 'data-testid': 'feature-preview-rows' }, createElement('li', null, 'Apples')),
		)

		expect(html).toContain('<ul')
		expect(html).toContain('data-testid="feature-preview-rows"')
		expect(html).toContain('<li>Apples</li>')
	})
})
