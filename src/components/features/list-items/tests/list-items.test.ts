import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AddItemSheet, AveragePrice, ItemEditForm, ItemQuantityChip, itemFormSchema, unitOptions } from '@/components/features/list-items'
import { AddItemForm } from '../add-item-form'

// The add form reads the App Router when it is opened; the sheet is closed here.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const valid = { name: 'Orange Juice', quantity: 1, unit: 'pcs' }

describe('itemFormSchema', () => {
	it('accepts a plain item and trims its name', () => {
		const result = itemFormSchema.safeParse({ ...valid, name: '  Orange Juice  ', notes: '' })

		expect(result.success).toBe(true)
		expect(result.data?.name).toBe('Orange Juice')
	})

	it('says what is wrong in the words the form shows', () => {
		const messages = (input: unknown) => itemFormSchema.safeParse(input).error?.issues.map(issue => issue.message)

		expect(messages({ ...valid, name: '' })).toContain('Name is required')
		expect(messages({ ...valid, quantity: 0 })).toContain('Must be above 0')
		expect(messages({ ...valid, quantity: 100 })).toContain('Cannot exceed 99')
		expect(messages({ ...valid, quantity: 1.25 })).toContain('Use steps of 0.1')
		expect(messages({ ...valid, quantity: Number.NaN })).toContain('Quantity is required')
		expect(messages({ ...valid, unit: '' })).toContain('Unit is required')
	})
})

describe('unitOptions', () => {
	it('adds the unit an item came with when the list of units does not have it', () => {
		expect(unitOptions(['pcs', 'kg'], 'unit')).toEqual(['unit', 'pcs', 'kg'])
		expect(unitOptions(['pcs', 'kg'], 'kg')).toEqual(['pcs', 'kg'])
		expect(unitOptions(['pcs', 'kg'], null)).toEqual(['pcs', 'kg'])
	})
})

describe('ItemQuantityChip', () => {
	it('shows the quantity in mono and its unit, and falls back to one unit', () => {
		const html = renderToStaticMarkup(createElement(ItemQuantityChip, { quantity: 0.51, unit: 'kg' }))
		const fallback = renderToStaticMarkup(createElement(ItemQuantityChip, {}))

		expect(html).toContain('data-testid="item-quantity-chip"')
		expect(html).toMatch(/<b class="font-mono[^>]*>0\.51<\/b>kg/)
		expect(fallback).toMatch(/>1<\/b>unit/)
	})

	it('fades once the item is in the cart', () => {
		expect(renderToStaticMarkup(createElement(ItemQuantityChip, { quantity: 1, unit: 'pcs', muted: true }))).toContain('opacity-60')
	})
})

describe('AddItemSheet', () => {
	it('is an Add Item button, disabled while the list is being shopped', () => {
		const open = renderToStaticMarkup(createElement(AddItemSheet, { target: { context: 'base-list', baseListId: 'l1' } }))
		const locked = renderToStaticMarkup(createElement(AddItemSheet, { target: { context: 'base-list', baseListId: 'l1' }, isLocked: true }))

		expect(open).toContain('data-testid="add-item-button-base-list"')
		expect(open).toContain('Add Item')
		expect(open).not.toContain('disabled=""')
		expect(locked).toContain('disabled=""')
	})

	it('names its context so a page can hold the list one and the session one', () => {
		const html = renderToStaticMarkup(createElement(AddItemSheet, { target: { context: 'shopping-session', sessionId: 's1' } }))

		expect(html).toContain('data-testid="add-item-button-shopping-session"')
	})
})

describe('AddItemForm', () => {
	it('uses Done when there is no draft and explains why a locked list cannot change', () => {
		const empty = renderToStaticMarkup(
			createElement(AddItemForm, { target: { context: 'base-list', baseListId: 'l1' }, onCancel: () => {} }),
		)
		const locked = renderToStaticMarkup(
			createElement(AddItemForm, { target: { context: 'base-list', baseListId: 'l1' }, isLocked: true, onCancel: () => {} }),
		)

		expect(empty).toContain('>Done</button>')
		expect(locked).toContain('A shopping session is using this list. Make changes in that session, or finish it to edit this base list.')
	})
})

describe('ItemEditForm', () => {
	it('labels the save action by its effect', () => {
		const html = renderToStaticMarkup(
			createElement(ItemEditForm, {
				item: { id: 'item-1', name: 'Orange Juice', quantity: 1, unit: 'pcs' },
				onSubmit: async () => {},
				onCancel: () => {},
			}),
		)

		expect(html).toContain('Save Changes')
		expect(html).not.toMatch(/>Save<\/button>/)
	})
})

describe('AveragePrice', () => {
	it('shows the amount as an average with its own test id', () => {
		const html = renderToStaticMarkup(createElement(AveragePrice, { price: 3.49 }))

		expect(html).toContain('data-testid="item-average-price"')
		expect(html).toContain('$3.49')
		expect(html).toContain('avg')
		expect(html).toContain('Average price')
		expect(html).toContain('font-mono')
	})

	it('takes the test id of its place so one row can be told from another', () => {
		const html = renderToStaticMarkup(createElement(AveragePrice, { price: 12, testId: 'base-list-item-1-average-price' }))

		expect(html).toContain('data-testid="base-list-item-1-average-price"')
		expect(html).toContain('$12.00')
	})

	it.each([null, undefined, 0, -3, Number.NaN])('draws nothing for %s, never a $0', price => {
		const html = renderToStaticMarkup(createElement(AveragePrice, { price }))

		expect(html).toBe('')
	})
})
