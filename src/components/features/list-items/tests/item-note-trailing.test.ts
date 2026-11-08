import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Badge } from '@/components/ui/badge'

import { ItemNote } from '../item-note'
import { ItemTrailing } from '../item-trailing'

describe('ItemNote', () => {
	it('puts a note icon before the text, smaller and lighter than the item name', () => {
		const html = renderToStaticMarkup(createElement(ItemNote, null, 'Lactose-free if on sale'))
		expect(html).toContain('aria-label="Item note"')
		expect(html).toContain('<svg')
		expect(html).toContain('Lactose-free if on sale')
		expect(html).toContain('text-xs')
		expect(html).toContain('truncate')
	})

	it('lets a trip row wrap the note instead of cutting it', () => {
		const html = renderToStaticMarkup(createElement(ItemNote, { wrap: true } as ComponentProps<typeof ItemNote>, 'Two of them'))
		expect(html).toContain('break-words')
		expect(html).not.toContain('truncate')
	})
})

describe('ItemTrailing', () => {
	it('stacks the price and the quantity on the right, the quantity under the price', () => {
		const html = renderToStaticMarkup(createElement(ItemTrailing, null, createElement('b', null, '$6.29'), createElement('i', null, '1 unit')))
		expect(html).toContain('flex-col')
		expect(html).toContain('items-end')
		expect(html.indexOf('$6.29')).toBeLessThan(html.indexOf('1 unit'))
	})
})

describe('store and default badges', () => {
	it('draws a store in violet, and one chosen by the user on white with a darker ring', () => {
		const auto = renderToStaticMarkup(createElement(Badge, { variant: 'store' }, 'No Frills'))
		const manual = renderToStaticMarkup(createElement(Badge, { variant: 'store-manual' }, 'Costco'))
		expect(auto).toContain('bg-violet-50')
		expect(auto).toContain('border-violet-200')
		expect(manual).toContain('bg-card')
		expect(manual).toContain('border-violet-300')
	})

	it('draws the Default list chip in yellow', () => {
		expect(renderToStaticMarkup(createElement(Badge, { variant: 'list-default' }, 'Default'))).toContain('bg-amber-100')
	})
})
