import { createRequire } from 'node:module'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Collapsible } from '@/components/ui/collapsible'
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu } from '@/components/ui/sidebar'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter, DialogHeader, dialogContentVariants, dialogDescriptionVariants, dialogTitleVariants } from '@/components/ui/dialog'
import { dropdownMenuContentVariants, dropdownMenuItemSizes } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CreateBaseListDialog, StartShoppingDialog } from '@/components/features/base-lists'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'
import { CreateGroupDialog } from '@/components/features/shopping-lists'
import { UploadTicketDialog } from '@/components/features/tickets'

/** `createElement` with loosely typed props, so the tests can pass `data-*` attributes to any component. */
const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement

// The dialogs read the App Router; their own flows are covered where they live.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const HEIGHTS = {
	xs: 'h-6',
	sm: 'h-8',
	default: 'h-9',
	lg: 'h-10',
	xl: 'h-11',
	primary: 'h-10',
	'link-action': 'h-10',
	'hero-action': 'h-10',
	'2xl': 'h-13',
	icon: 'size-9',
	'icon-xs': 'size-6',
	'icon-sm': 'size-8',
	'icon-lg': 'size-10',
	'icon-xl': 'size-11',
	'icon-2xl': 'size-12',
	avatar: 'size-11',
} as const

/** The classes of the first element that carries `data-testid`. */
function classOf(html: string, testId: string) {
	const tag = html.match(new RegExp(`<[a-z]+[^>]*data-testid="${testId}"[^>]*>`))?.[0] ?? ''
	return tag.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? []
}

describe('Button', () => {
	it.each(Object.entries(HEIGHTS))('size %s sets %s', (size, expected) => {
		const classes = buttonVariants({ size: size as keyof typeof HEIGHTS }).split(/\s+/)
		expect(classes).toContain(expected)
	})

	it('takes the A1 shape and the secondary surface from its own props', () => {
		const html = renderToStaticMarkup(h(Button, { variant: 'secondary', size: 'xl', 'data-testid': 'b' }, 'Go'))
		const classes = classOf(html, 'b')

		expect(classes).toEqual(expect.arrayContaining(['h-11', 'rounded-xl', 'bg-secondary', 'text-secondary-foreground', 'font-display']))
		expect(html).toContain('data-size="xl"')
		expect(html).toContain('data-variant="secondary"')
	})

	it('keeps the native xl of the library: 44px high, 24px padding and 16px text', () => {
		const classes = buttonVariants({ size: 'xl' }).split(/\s+/)

		expect(classes).toEqual(expect.arrayContaining(['h-11', 'px-6', 'text-base', 'gap-2']))
		expect(classes).not.toContain('px-4')
		// The other sizes keep their own text size (the base is `text-sm`); only xl and 2xl step up to base.
		expect(buttonVariants({ size: 'lg' }).split(/\s+/)).not.toContain('text-base')
	})

	it('primary is 40px on phones and 44px from md up', () => {
		const classes = buttonVariants({ size: 'primary' }).split(/\s+/)

		expect(classes).toEqual(expect.arrayContaining(['h-10', 'px-3', 'md:h-11', 'md:px-4']))
		expect(classes).not.toContain('md:text-base')
	})

	it('link actions are 40px on phones and 44px from md up', () => {
		const classes = buttonVariants({ size: 'link-action' }).split(/\s+/)

		expect(classes).toEqual(expect.arrayContaining(['h-10', 'px-3', 'md:h-11']))
	})

	it('forwards the link action size to its child anchor', () => {
		const html = renderToStaticMarkup(h(Button, { asChild: true, size: 'link-action' }, h('a', { href: '/', 'data-testid': 'link-action' }, 'Open')))
		const classes = classOf(html, 'link-action')

		expect(classes).toEqual(expect.arrayContaining(['h-10', 'md:h-11']))
	})

	it('forwards the primary size to its child anchor', () => {
		const html = renderToStaticMarkup(h(Button, { asChild: true, size: 'primary' }, h('a', { href: '/', 'data-testid': 'primary-link' }, 'Open')))
		const classes = classOf(html, 'primary-link')

		expect(classes).toEqual(expect.arrayContaining(['h-10', 'md:h-11']))
	})

	it('default is the library lg from md up', () => {
		const classes = buttonVariants({ size: 'default' }).split(/\s+/)

		expect(classes).toEqual(expect.arrayContaining(['h-9', 'px-3', 'md:h-10', 'md:px-4']))
	})

	it('hero action is lg on phones and xl from md up', () => {
		const classes = buttonVariants({ size: 'hero-action' }).split(/\s+/)

		expect(classes).toEqual(expect.arrayContaining(['h-10', 'px-4', 'md:h-11', 'md:px-6', 'md:text-base']))
	})

	it('has an avatar size that is a circle on phones and a pill from lg, and a weight for the landing header', () => {
		const avatar = buttonVariants({ size: 'avatar', rounded: 'full' }).split(/\s+/)

		expect(avatar).toEqual(expect.arrayContaining(['size-11', 'gap-0', 'lg:w-auto', 'lg:gap-2.5', 'lg:pr-2', 'lg:pl-1', 'rounded-full']))
		expect(buttonVariants({}).split(/\s+/)).toContain('font-semibold')
		// `cn()` merges the base weight away, so the rendered button carries only the medium one.
		const rendered = classOf(renderToStaticMarkup(h(Button, { weight: 'medium', 'data-testid': 'b' }, 'Go')), 'b')
		expect(rendered).toContain('font-medium')
		expect(rendered).not.toContain('font-semibold')
		expect(renderToStaticMarkup(h(Button, { weight: 'medium', 'data-testid': 'b' }, 'Go'))).not.toContain('weight=')
	})

	it('lets `rounded` change the corner instead of a class', () => {
		const classes = classOf(renderToStaticMarkup(h(Button, { rounded: 'full', 'data-testid': 'b' }, 'Go')), 'b')

		expect(classes).toContain('rounded-full')
		expect(classes).not.toContain('rounded-xl')
	})

	it('has a hero, a fab, a success-soft and a destructive variant for the app', () => {
		expect(buttonVariants({ variant: 'hero' })).toContain('shadow-glow')
		expect(buttonVariants({ variant: 'fab' })).toContain('shadow-fab')
		expect(buttonVariants({ variant: 'success-soft' })).toContain('bg-green-100')
		expect(buttonVariants({ variant: 'destructive' })).toContain('bg-destructive')
		expect(buttonVariants({})).not.toContain('from-white/20')
		expect(buttonVariants({ variant: 'hero' })).toContain('from-white/20')
		expect(buttonVariants({ variant: 'fab' })).toContain('from-white/20')
	})
})

describe('wrappers around a Button hand its props through', () => {
	const triggers = {
		'new group': { render: (props: Record<string, unknown>) => h(CreateGroupDialog, props), testId: 'create-group-button' },
		'new base list': { render: (props: Record<string, unknown>) => h(CreateBaseListDialog, { groupId: 'g1', ...props }), testId: 'create-base-list-button' },
		'share': { render: (props: Record<string, unknown>) => h(ShareListDialog, { baseListId: 'l1', listName: 'Dinner', isOwner: true, ...props }), testId: 'share-list-button' },
		'add item': { render: (props: Record<string, unknown>) => h(AddItemSheet, { target: { context: 'base-list', baseListId: 'l1' }, ...props }), testId: 'add-item-button-base-list' },
		'start shopping': { render: (props: Record<string, unknown>) => h(StartShoppingDialog, { baseListId: 'l1', baseListName: 'Dinner', itemsCount: 3, ...props }), testId: 'start-shopping-button' },
	}

	it.each(Object.entries(triggers))('%s renders at the size its own default declares', (_name, { render, testId }) => {
		const html = renderToStaticMarkup(render({}))
		const declared = html.match(new RegExp(`data-size="([a-z0-9-]+)"[^>]*data-testid="${testId}"|data-testid="${testId}"[^>]*data-size="([a-z0-9-]+)"`))
		const size = (declared?.[1] ?? declared?.[2]) as keyof typeof HEIGHTS

		expect(size, `${testId} has no data-size`).toBeTruthy()
		expect(classOf(html, testId)).toContain(HEIGHTS[size])
	})

	it('has a behaviour case for every wrapper the scanner derives from the source', () => {
		const { scan } = createRequire(import.meta.url)('../../../test/native-props-scan.cjs') as {
			scan: () => { wrappers: { name: string; takesButtonProps: boolean }[] }
		}
		const derived = scan().wrappers.filter(w => w.takesButtonProps).map(w => w.name)
		const covered = ['CreateGroupDialog', 'CreateBaseListDialog', 'ShareListDialog', 'AddItemSheet', 'StartShoppingDialog', 'UploadTicketDialog']

		expect([...derived].sort()).toEqual([...covered].sort())
	}, 60_000)

	it.each(Object.entries(triggers))('%s obeys the size and variant it is given', (_name, { render, testId }) => {
		const html = renderToStaticMarkup(render({ size: 'sm', variant: 'ghost' }))
		const classes = classOf(html, testId)

		expect(classes).toContain('h-8')
		expect(classes).not.toContain('h-11')
		expect(html).toContain('data-variant="ghost"')
	})

	it('the upload trigger obeys the size it is given too', () => {
		const small = renderToStaticMarkup(h(UploadTicketDialog, { size: 'sm', variant: 'secondary' }))
		const fallback = renderToStaticMarkup(h(UploadTicketDialog))

		expect(small).toContain('data-size="sm"')
		expect(small).toContain('h-8')
		expect(fallback).toContain('data-size="primary"')
	})
})

describe('fields and surfaces take their size from props', () => {
	it('Input: default is 36px, `lg` the 44px touch field with the 16px corner', () => {
		const base = renderToStaticMarkup(h(Input, { 'data-testid': 'i' }))
		const lg = renderToStaticMarkup(h(Input, { size: 'lg', 'data-testid': 'i' }))

		expect(classOf(base, 'i')).toEqual(expect.arrayContaining(['h-9', 'rounded-xl', 'shadow-field']))
		expect(classOf(lg, 'i')).toEqual(expect.arrayContaining(['h-11', 'rounded-2xl', 'shadow-field']))
		expect(classOf(lg, 'i')).not.toContain('h-9')
	})

	it('Input: `adornment="end"` leaves room for a 44px control over the end of the field', () => {
		const adorned = classOf(renderToStaticMarkup(h(Input, { size: 'lg', adornment: 'end', 'data-testid': 'i' })), 'i')

		expect(adorned).toEqual(expect.arrayContaining(['h-11', 'shadow-field', 'pr-13']))
		expect(classOf(renderToStaticMarkup(h(Input, { 'data-testid': 'i' })), 'i')).not.toContain('pr-13')
	})

	it('Textarea carries the same field surface', () => {
		expect(classOf(renderToStaticMarkup(h(Textarea, { 'data-testid': 't' })), 't')).toEqual(
			expect.arrayContaining(['rounded-2xl', 'shadow-field', 'bg-card']),
		)
	})

	it('SelectTrigger has a `lg` size', () => {
		const html = renderToStaticMarkup(h(Select, null, h(SelectTrigger, { size: 'lg', 'data-testid': 's' })))

		expect(html).toContain('data-size="lg"')
		expect(classOf(html, 's')).toContain('data-[size=lg]:h-11')
	})

	it('Card uses responsive 12/16px padding and keeps the same inset across row sizes', () => {
		const base = classOf(renderToStaticMarkup(h(Card, { 'data-testid': 'c' })), 'c')
		const tight = classOf(renderToStaticMarkup(h(Card, { size: 'tight', 'data-testid': 'c' })), 'c')

		expect(base).toEqual(expect.arrayContaining(['rounded-3xl', 'border-0', 'shadow-card', 'transition-shadow', 'motion-reduce:transition-none']))
		expect(base).toEqual(expect.arrayContaining(['py-3', 'md:py-4']))
		expect(tight).toEqual(expect.arrayContaining(['gap-0', 'p-3', 'md:p-4']))
	})

	it('Badge: status variants and a `lg` size replace the one-off classes', () => {
		const lg = renderToStaticMarkup(h(Badge, { variant: 'outline', size: 'lg', 'data-testid': 'g' }, 'Today'))

		expect(classOf(lg, 'g')).toEqual(expect.arrayContaining(['h-7', 'bg-card']))
		expect(renderToStaticMarkup(h(Badge, { variant: 'completed' }, 'Done'))).toContain('bg-green-100')
		expect(renderToStaticMarkup(h(Badge, { variant: 'failed' }, 'Failed'))).toContain('bg-red-100')
	})
})

describe('the variants that replaced per-call classes', () => {
	it('Label is the A1 form label by default (14px semibold)', () => {
		expect(classOf(renderToStaticMarkup(h(Label, { 'data-testid': 'l' }, 'Name')), 'l')).toEqual(expect.arrayContaining(['text-sm', 'font-semibold']))
	})

	it('Checkbox `size="lg"` is the 22px touch box', () => {
		const base = classOf(renderToStaticMarkup(h(Checkbox, { 'data-testid': 'c' })), 'c')
		const lg = classOf(renderToStaticMarkup(h(Checkbox, { size: 'lg', 'data-testid': 'c' })), 'c')

		expect(base).toEqual(expect.arrayContaining(['h-4', 'w-4', 'rounded-sm']))
		expect(lg).toEqual(expect.arrayContaining(['size-5.5', 'rounded-md', 'border-slate-400']))
		expect(lg).not.toContain('h-4')
	})

	it('Progress takes its height from `size`, its track from `tone`, and its fill from `tone` / `complete`', () => {
		const sm = renderToStaticMarkup(h(Progress, { value: 40, size: 'sm', tone: 'soft', 'data-testid': 'p' }))
		const dark = renderToStaticMarkup(h(Progress, { value: 40, size: 'md', tone: 'on-dark' }))
		const done = renderToStaticMarkup(h(Progress, { value: 100, size: 'md', tone: 'track', complete: true }))

		expect(classOf(sm, 'p')).toEqual(expect.arrayContaining(['h-1.5', 'bg-blue-100']))
		expect(dark).toContain('h-2')
		expect(dark).toContain('bg-white/15')
		expect(dark).toContain('from-blue-400')
		expect(done).toContain('bg-green-500')
		expect(sm).toContain('transition-transform')
		expect(sm).toContain('motion-reduce:transition-none')
	})

	it('Avatar sizes reach the 96px portrait, with an optional ring, and the fallback has tones', () => {
		const portrait = renderToStaticMarkup(h(Avatar, { size: '2xl', ring: true, 'data-testid': 'a' }, h(AvatarFallback, { tone: 'soft', 'data-testid': 'f' }, 'JT')))

		expect(portrait).toContain('data-[size=2xl]:size-24')
		expect(portrait).toContain('data-size="2xl"')
		expect(classOf(portrait, 'a')).toContain('ring-2')
	})

	it('Card titles and descriptions come in variants', () => {
		const title = renderToStaticMarkup(h(CardTitle, { variant: 'display', 'data-testid': 't' }, 'Welcome'))
		const description = renderToStaticMarkup(h(CardDescription, { size: 'lg', weight: 'medium', 'data-testid': 'd' }, 'Sign in'))

		expect(classOf(title, 't')).toEqual(expect.arrayContaining(['text-3xl', 'font-bold']))
		expect(classOf(description, 'd')).toEqual(expect.arrayContaining(['text-base', 'font-medium']))
	})

	it('Dialog parts have the A1 sheet and the dark viewer as variants', () => {
		expect(dialogContentVariants({ variant: 'sheet' })).toContain('rounded-3xl')
		expect(dialogContentVariants({ variant: 'viewer' })).toContain('bg-ink')
		expect(dialogTitleVariants({ variant: 'sheet' })).toContain('text-xl')
		expect(dialogTitleVariants({ variant: 'strong' })).toContain('font-bold')
		expect(dialogDescriptionVariants({ variant: 'sheet' })).toContain('text-slate-500')
	})

	it('Dropdown menu has the A1 menu and account surfaces and touch / row / action items', () => {
		expect(dropdownMenuContentVariants({ variant: 'menu' })).toContain('shadow-menu')
		expect(dropdownMenuContentVariants({ variant: 'account' })).toContain('rounded-3xl')
		expect(dropdownMenuItemSizes.touch).toContain('min-h-11')
		expect(dropdownMenuItemSizes.row).toContain('min-h-13')
		expect(dropdownMenuItemSizes.action).toContain('bg-secondary')
	})

	it('Button has the viewer, quiet, destructive-ghost, dropzone and block variants', () => {
		expect(buttonVariants({ variant: 'on-dark' })).toContain('bg-white/12')
		expect(buttonVariants({ variant: 'viewer' })).toContain('bg-slate-900/80')
		expect(buttonVariants({ variant: 'quiet' })).toContain('text-slate-600')
		expect(buttonVariants({ variant: 'destructive-ghost' })).toContain('text-red-700')
		expect(buttonVariants({ variant: 'dropzone', size: 'block' })).toEqual(expect.stringContaining('border-dashed'))
		expect(buttonVariants({ size: 'block' })).toContain('h-auto')
		expect(buttonVariants({})).not.toContain('from-white/20')
		expect(buttonVariants({ variant: 'hero' })).toContain('from-white/20')
		expect(buttonVariants({ variant: 'fab' })).toContain('from-white/20')
	})

	it('Button has the segment, quiet-on-dark and inverse variants and a 44px touch size for the auth screens', () => {
		expect(buttonVariants({ variant: 'segment' })).toContain('aria-[current=page]:bg-card')
		expect(buttonVariants({ variant: 'quiet-on-dark' })).toContain('text-slate-50')
		expect(buttonVariants({ variant: 'inverse' })).toContain('bg-white')
		expect(buttonVariants({ size: 'touch' })).toEqual(expect.stringContaining('h-11'))
		expect(buttonVariants({ size: 'touch' })).not.toContain('text-base')
	})
})

describe('container spacing is theme: it comes from variants', () => {
	it('CardContent has `space` (snug / stack) and `inset` (compact)', () => {
		const at = (props: Record<string, unknown>) => classOf(renderToStaticMarkup(h(CardContent, { 'data-testid': 'x', ...props })), 'x')

		expect(at({})).not.toEqual(expect.arrayContaining(['space-y-4']))
		expect(at({ space: 'snug' })).toContain('gap-3')
		expect(at({ space: 'stack' })).toContain('space-y-4')
		expect(at({ inset: 'compact' })).toEqual(expect.arrayContaining(['px-3', 'md:px-4']))
		expect(at({ inset: 'compact' })).not.toContain('px-6')
	})

	it('DialogHeader `sheet` and DialogFooter `inline` replace the class strings the sheets used to pass', () => {
		const header = classOf(renderToStaticMarkup(h(DialogHeader, { variant: 'sheet', 'data-testid': 'x' })), 'x')
		const footer = classOf(renderToStaticMarkup(h(DialogFooter, { variant: 'inline', 'data-testid': 'x' })), 'x')

		expect(header).toEqual(expect.arrayContaining(['relative', 'gap-1', 'pr-12', 'text-left']))
		expect(footer).toEqual(expect.arrayContaining(['flex-row', 'gap-3', 'sm:space-x-0']))
		expect(classOf(renderToStaticMarkup(h(DialogFooter, { 'data-testid': 'x' })), 'x')).not.toContain('gap-3')
	})

	it('DialogFooter `sheet` stacks two actions with the primary on top and splits them in two columns from sm', () => {
		const sheet = classOf(renderToStaticMarkup(h(DialogFooter, { variant: 'sheet', 'data-testid': 'x' })), 'x')

		expect(sheet).toEqual(expect.arrayContaining(['flex-col-reverse', 'gap-3', 'sm:grid', 'sm:grid-cols-2']))
	})

	it('Collapsible `section` leaves room under its open content', () => {
		expect(classOf(renderToStaticMarkup(h(Collapsible, { variant: 'section', 'data-testid': 'x' })), 'x')).toContain('data-[state=open]:pb-2.5')
		expect(classOf(renderToStaticMarkup(h(Collapsible, { 'data-testid': 'x' })), 'x')).not.toContain('data-[state=open]:pb-2.5')
	})

	it('the sidebar parts carry the A1 spacing as their default', () => {
		const at = (part: unknown) => classOf(renderToStaticMarkup(h(part, { 'data-testid': 'x' })), 'x')

		expect(at(SidebarContent)).toEqual(expect.arrayContaining(['gap-3', 'p-2']))
		expect(at(SidebarFooter)).toEqual(expect.arrayContaining(['gap-3', 'p-2']))
		expect(at(SidebarGroup)).toEqual(expect.arrayContaining(['gap-0.5', 'p-0']))
		expect(at(SidebarMenu)).toEqual(expect.arrayContaining(['gap-px', 'px-1.5']))
	})
})
