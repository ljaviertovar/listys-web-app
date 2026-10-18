import { createElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Folder01Icon } from '@hugeicons/core-free-icons'

import {
	CategorySection,
	EmptyStateCard,
	EntityCard,
	EntityCardSkeleton,
	FormField,
	ListToolbar,
	RowMenu,
	SheetDialog,
	getCategoryIcon,
	getCategoryTone,
} from '@/components/commons'

const noop = () => {}

// Components whose props require `children` are built with children as the extra arguments, the way React.createElement takes them.
const h = createElement as unknown as (type: unknown, props: object | null, ...children: ReactNode[]) => ReactElement

describe('category style', () => {
	it('gives every known category its own colour and an unknown one a neutral slate', () => {
		expect(getCategoryTone('Bakery')).toContain('text-amber-700')
		expect(getCategoryTone('Dairy')).toContain('text-sky-700')
		expect(getCategoryTone('Frozen')).toContain('text-teal-700')
		expect(getCategoryTone('Home')).toContain('text-indigo-700')
		expect(getCategoryTone('Produce')).toContain('text-green-700')
		expect(getCategoryTone('Something New')).toContain('text-slate-600')
	})

	it('shares the icon between names that mean the same shelf, and falls back to a box', () => {
		expect(getCategoryIcon('Bakery')).toBe(getCategoryIcon('Bakery Commercial'))
		expect(getCategoryIcon('Frozen')).toBe(getCategoryIcon('Frozen Food'))
		expect(getCategoryIcon('Something New')).not.toBe(getCategoryIcon('Bakery'))
	})
})

describe('CategorySection', () => {
	const render = (props: Partial<Parameters<typeof CategorySection>[0]> = {}) =>
		renderToStaticMarkup(
			h(CategorySection, { category: 'Dairy', count: '2 items', testId: 'category-dairy', ...props }, createElement('p', null, 'rows')),
		)

	it('shows the category as an uppercase caption with its coloured icon and its count', () => {
		const html = render()

		expect(html).toContain('data-testid="category-dairy"')
		expect(html).toContain('uppercase')
		expect(html).toContain('text-xs')
		expect(html).toContain('tracking-[0.04em]')
		expect(html).toContain('text-sky-700')
		expect(html).toContain('2 items')
		expect(html).toContain('rows')
	})

	it('turns the count green once everything in the category is done', () => {
		expect(render({ complete: true, count: '2/2' })).toContain('text-green-700')
		expect(render({ count: '0/2' })).not.toContain('font-semibold text-green-700')
	})

	it('hides its rows while it is folded', () => {
		expect(render({ defaultOpen: false })).not.toContain('rows')
	})
})

describe('FormField', () => {
	it('marks a required field and shows its error with an icon and role alert', () => {
		const html = renderToStaticMarkup(
			h(FormField, { htmlFor: 'name', label: 'Name', required: true, error: 'Name is required', testId: 'name-field' }, createElement('input', { id: 'name' })),
		)

		expect(html).toContain('data-testid="name-field"')
		expect(html).toContain('for="name"')
		expect(html).toContain('role="alert"')
		expect(html).toContain('id="name-error"')
		expect(html).toContain('Name is required')
		expect(html).toContain('<svg')
	})

	it('shows no error line when the field is valid', () => {
		const html = renderToStaticMarkup(h(FormField, { htmlFor: 'n', label: 'Notes', testId: 'f' }, createElement('input')))

		expect(html).not.toContain('role="alert"')
	})
})

describe('EntityCard', () => {
	const card = (overrides: Partial<Parameters<typeof EntityCard>[0]> = {}) =>
		renderToStaticMarkup(
			createElement(EntityCard, {
				href: '/shopping-lists/g1/lists',
				icon: Folder01Icon,
				title: 'Walmart',
				description: 'Weekly Groceries..',
				count: 2,
				unit: { one: 'list', many: 'lists' },
				emptyLabel: 'lists',
				linkLabel: 'View Details',
				menu: { label: 'More options for Walmart', editLabel: 'Edit Group', deleteLabel: 'Delete Group', onEdit: noop, onDelete: noop },
				testId: 'group-card-g1',
				...overrides,
			}),
		)

	it('makes only the footer action a link and keeps the menu independently interactive', () => {
		const html = card()

		expect(html).toContain('data-testid="group-card-g1"')
		expect(html).toContain('href="/shopping-lists/g1/lists"')
		expect(html).toMatch(/<h2[^>]*>Walmart<\/h2>/)
		expect(html).not.toContain('after:absolute after:inset-0')
		expect(html).toContain('aria-label="More options for Walmart"')
		expect(html).not.toContain('relative z-10')
		expect(html).toContain('View Details')
	})

	it('counts in mono with the right word and reads "No â€¦ yet" at zero', () => {
		expect(card({ count: 1 })).toMatch(/<b class="font-mono[^>]*>1<\/b> list</)
		expect(card()).toMatch(/<b class="font-mono[^>]*>2<\/b> lists</)
		expect(card({ count: 0 })).toContain('No lists yet')
	})

	it('leaves out the menu of a read-only card', () => {
		expect(card({ menu: undefined })).not.toContain('More options')
	})
})

describe('ListToolbar', () => {
	it('counts with the right word and holds the screen actions', () => {
		const one = renderToStaticMarkup(h(ListToolbar, { count: 1, unit: { one: 'item', many: 'items' }, testId: 'toolbar' }, createElement('button', null, 'Add')))
		const many = renderToStaticMarkup(h(ListToolbar, { count: 4, unit: { one: 'item', many: 'items' }, testId: 'toolbar' }))

		expect(one).toContain('data-testid="toolbar"')
		expect(one).toMatch(/>1<\/b> item</)
		expect(one).toContain('Add')
		expect(many).toMatch(/>4<\/b> items</)
	})
})

describe('EmptyStateCard and skeleton', () => {
	it('shows what is missing and the one action that fixes it', () => {
		const html = renderToStaticMarkup(
			h(EmptyStateCard, { icon: Folder01Icon, title: 'No groups yet', description: 'Create one group.', testId: 'empty' }, createElement('button', null, 'New Group')),
		)

		expect(html).toContain('data-testid="empty"')
		expect(html).toContain('No groups yet')
		expect(html).toContain('New Group')
		expect(html).toContain('bg-blue-100')
	})

	it('uses the amber tile for a notice', () => {
		const html = renderToStaticMarkup(h(EmptyStateCard, { icon: Folder01Icon, tone: 'amber', title: 'T', description: 'D', testId: 'e' }))

		expect(html).toContain('bg-amber-100')
	})

	it('hides the loading card from assistive tech', () => {
		const html = renderToStaticMarkup(createElement(EntityCardSkeleton, { testId: 'sk' }))

		expect(html).toContain('data-testid="sk"')
		expect(html).toContain('aria-hidden="true"')
	})
})

describe('RowMenu and SheetDialog', () => {
	it('names its trigger after what it belongs to and can be disabled', () => {
		const html = renderToStaticMarkup(
			createElement(RowMenu, { label: 'More options for Milk', testId: 'menu', disabled: true, actions: [{ label: 'Edit Item', icon: Folder01Icon, onSelect: noop }] }),
		)

		expect(html).toContain('aria-label="More options for Milk"')
		expect(html).toContain('data-testid="menu"')
		expect(html).toContain('disabled=""')
	})

	it('renders only its trigger until it is opened', () => {
		const html = renderToStaticMarkup(
			h(SheetDialog, { trigger: createElement('button', null, 'Open'), title: 'Sheet', testId: 'sheet' }, createElement('p', null, 'body')),
		)

		expect(html).toContain('Open')
		expect(html).not.toContain('body')
	})
})
