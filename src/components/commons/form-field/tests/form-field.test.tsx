import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FormField } from '../form-field'

describe('application form field feedback', () => {
	it('replaces the hint with an announced error while retaining the control association', () => {
		const props = { htmlFor: 'list-name', label: 'List name', hint: 'Optional hint', testId: 'list-name-field', children: createElement('input', { id: 'list-name' }) }
		const valid = renderToStaticMarkup(createElement(FormField, props))
		const invalid = renderToStaticMarkup(createElement(FormField, { ...props, error: 'Name required' }))
		expect(valid).toContain('id="list-name-hint"')
		expect(valid).not.toContain('role="alert"')
		expect(invalid).toContain('for="list-name"')
		expect(invalid).toContain('id="list-name-error"')
		expect(invalid).toContain('role="alert"')
		expect(invalid).not.toContain('id="list-name-hint"')
	})
})
