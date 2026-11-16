import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PageHeader from '../page-header'

const render = (props: Parameters<typeof PageHeader>[0]) => renderToStaticMarkup(createElement(PageHeader, props))

describe('PageHeader slots', () => {
	it('renders only the title when every other slot is empty', () => {
		const html = render({ title: 'Profile' })
		expect(html).toContain('Profile')
		expect(html).not.toContain('data-testid="back-link"')
		expect(html).not.toContain('page-header-icon')
		expect(html).not.toContain('page-header-chips')
		expect(html).not.toContain('page-header-data')
		expect(html).not.toContain('page-header-count')
	})

	it('drops empty chips and facts, and the metadata group with them', () => {
		const empty = render({ title: 'Trip', chips: [null, false], facts: [null, false, undefined] })
		expect(empty).not.toContain('page-header-chips')
		expect(empty).not.toContain('page-header-data')
		expect(empty).not.toContain('mt-1 flex')

		const filled = render({ title: 'Trip', chips: [null, createElement('span', { key: 'a' }, 'Default')], facts: [null, { value: 'Last trip 5 Nov' }] })
		expect(filled).toContain('page-header-chips')
		expect(filled).toContain('Default')
		expect(filled).toContain('Last trip 5 Nov')
	})

	it('puts the quantity, time and amount facts in the order given with a unit after a figure', () => {
		const html = render({ title: 'Metro', layout: 'detail', facts: [{ kind: 'count', value: 18, unit: 'items' }, { kind: 'time', value: '12 Nov' }, { kind: 'total', value: '$84.50' }] })
		expect(html.indexOf('18')).toBeLessThan(html.indexOf('12 Nov'))
		expect(html.indexOf('12 Nov')).toBeLessThan(html.indexOf('$84.50'))
		expect(html).toMatch(/18<\/span> items/)
	})

	it('pluralizes the count and leaves a zero count to the empty state', () => {
		const count = (value: number) => render({ title: 'Lists', count: { value, one: 'list', many: 'lists' } })
		expect(count(1)).toMatch(/>1<\/b> list</)
		expect(count(11)).toMatch(/>11<\/b> lists</)
		expect(count(0)).not.toContain('page-header-count')
	})

	it('keeps the title on one line for an index and lets an object screen use two', () => {
		expect(render({ title: 'Lists' })).toContain('truncate')
		const detail = render({ title: 'A long name', layout: 'detail', aside: createElement('span', null, 'Completed') })
		expect(detail).toContain('line-clamp-2')
		expect(detail).toContain('mt-1.5')
	})
})
