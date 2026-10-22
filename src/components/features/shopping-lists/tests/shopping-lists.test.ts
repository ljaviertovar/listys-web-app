import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { GroupCard, GroupsList, GroupsSkeleton } from '@/components/features/shopping-lists'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
// The card calls server actions only when the user edits or deletes.
vi.mock('@/actions', () => ({ updateGroup: vi.fn(), deleteGroup: vi.fn() }))

const group = (overrides = {}) => ({ id: 'g1', name: 'Walmart', description: 'Weekly Groceries..', base_lists: [{ count: 2 }], ...overrides })

describe('GroupsList', () => {
	it('counts the groups and offers New Group above a grid of cards', () => {
		const html = renderToStaticMarkup(createElement(GroupsList, { groups: [group(), group({ id: 'g2', name: 'Costco', base_lists: [{ count: 1 }] })] }))

		expect(html).toContain('data-testid="groups-toolbar"')
		expect(html).toMatch(/>2<\/b> groups</)
		expect(html).toContain('data-testid="create-group-button"')
		expect(html).toContain('grid-cols-1')
		expect(html).toContain('data-testid="group-card-g1"')
		expect(html).toContain('data-testid="group-card-g2"')
	})

	it('invites the first group with a card of its own and no toolbar', () => {
		const html = renderToStaticMarkup(createElement(GroupsList, { groups: [] }))

		expect(html).toContain('data-testid="groups-empty-state"')
		expect(html).toContain('No groups yet')
		expect(html).toContain('Keep related base lists together, for example by store or household.')
		expect(html).toContain('data-testid="create-group-button"')
		expect(html).not.toContain('groups-toolbar')
	})
})

describe('GroupCard', () => {
	const render = (props = {}) => renderToStaticMarkup(createElement(GroupCard, { group: group(), ...props }))

	it('links to the lists of the group, counts them and has the ⋯ menu', () => {
		const html = render()

		expect(html).toContain('href="/shopping-lists/g1/lists"')
		expect(html).toMatch(/>2<\/b> lists</)
		expect(html).toContain('aria-label="More options for Walmart"')
		expect(html).toContain('>View Lists<')
		expect(html).toContain('aria-label="View Lists in Walmart"')
	})

	it('reads "No lists yet" for an empty group', () => {
		expect(render({ group: group({ base_lists: [{ count: 0 }] }) })).toContain('No lists yet')
	})

	it('distinguishes an unknown list count from a known empty group', () => {
		expect(render({ group: group({ base_lists: undefined }) })).toContain('Count unavailable')
		expect(render({ group: group({ base_lists: [] }) })).toContain('No lists yet')
	})

	it('uses singular and plural names for shopping history counts', () => {
		const one = render({ history: true, group: group({ completed_runs_count: 1 }) })
		const none = render({ history: true, group: group({ completed_runs_count: 0 }) })

		expect(one).toMatch(/>1<\/b> shopping session</)
		expect(none).toContain('No shopping sessions yet')
	})

	it('names the history destination and has no menu on read-only history cards', () => {
		const html = render({ history: true, group: group({ completed_runs_count: 3 }) })

		expect(html).toContain('href="/shopping-history/g1"')
		expect(html).toMatch(/>3<\/b> shopping sessions</)
		expect(html).toContain('aria-label="View History in Walmart"')
		expect(html).not.toContain('More options')
	})

	it('keeps long group titles and descriptions readable without truncating them', () => {
		const html = render({ group: group({ name: 'Household groceries for the summer cabin', description: 'Pantry staples, shared meals, and supplies for each visit.' }) })

		expect(html).toContain('Household groceries for the summer cabin')
		expect(html).toContain('Pantry staples, shared meals, and supplies for each visit.')
		expect(html).not.toContain('truncate')
	})
})

describe('GroupsSkeleton', () => {
	it('draws the toolbar and three card shapes', () => {
		const html = renderToStaticMarkup(createElement(GroupsSkeleton))

		expect(html).toContain('data-testid="groups-skeleton"')
		expect(html.match(/data-testid="group-card-skeleton-\d"/g)).toHaveLength(3)
	})
})
