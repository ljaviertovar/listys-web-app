import { describe, expect, it } from 'vitest'

import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import type { LineDecision } from '../../add-to-list/helpers/merge-review'
import { buildReceiptTriage } from '../helpers/build-receipt-triage'

function item(id: string, overrides: Partial<TicketItem> = {}): TicketItem {
	return {
		id,
		ticket_id: 'ticket-1',
		name: id,
		category: 'Other',
		price: 1,
		quantity: 1,
		unit: 'unit',
		created_at: null,
		normalized_name: null, shopping_session_item_id: null,
		...overrides,
	}
}

function match(id: string, kind: TicketItemMatch['match'], overrides: Partial<TicketItemMatch> = {}): TicketItemMatch {
	return {
		ticket_item_id: id,
		match: kind,
		base_list_item: kind === 'none' ? null : { id: `base-${id}`, name: `List ${id}` },
		suggestion: null,
		...overrides,
	}
}

const ORGANIC = { id: 'organic', name: 'Organic Bananas' }
const decisions = (entries: Array<[string, LineDecision]>) => new Map(entries)

describe('buildReceiptTriage sections and badges', () => {
	it('puts pending lines first and says why each one is pending', () => {
		const sections = buildReceiptTriage(
			[item('proposal', { name: 'ORG BANANAS', price: null }), item('fresh'), item('matched')],
			[
				match('proposal', 'none', { suggestion: ORGANIC }),
				match('fresh', 'none'),
				match('matched', 'name'),
			],
		)

		expect(sections.map(section => [section.id, section.lines.length, section.startsFolded])).toEqual([
			['check', 1, false],
			['fresh', 1, false],
			['matched', 1, true],
		])
		expect(sections[0].lines[0].badges).toEqual(['confirm-match', 'no-price'])
		expect(sections[0].lines[0].proposal).toEqual(ORGANIC)
		expect(sections[1].lines[0].badges).toEqual(['new'])
		expect(sections[2].lines[0].badges).toEqual(['in-list'])
	})

	it('keeps a priced line with a proposal pending with a single "confirm match" badge, without changing its match', () => {
		const [section] = buildReceiptTriage(
			[item('bananas', { name: 'ORG BANANAS' })],
			[match('bananas', 'none', { suggestion: ORGANIC })],
		)

		expect(section.id).toBe('check')
		expect(section.lines[0].badges).toEqual(['confirm-match'])
		expect(section.lines[0].match?.match).toBe('none')
		expect(section.lines[0].target).toBeNull()
	})

	it('marks a line without a price even when it matches by name, and keeps its place in the list', () => {
		const [section] = buildReceiptTriage([item('yogurt', { price: null })], [match('yogurt', 'name')])

		expect(section.id).toBe('check')
		expect(section.lines[0].badges).toEqual(['in-list', 'no-price'])
		expect(section.lines[0].target).toEqual({ id: 'base-yogurt', name: 'List yogurt' })
	})

	it('calls an unmatched line without a price only "no price", not new', () => {
		const [section] = buildReceiptTriage([item('mystery', { price: null })], [match('mystery', 'none')])

		expect(section.lines[0].badges).toEqual(['no-price'])
	})

	it('keeps name and remembered matches in receipt order and marks remembered links', () => {
		const sections = buildReceiptTriage(
			[item('first'), item('remembered'), item('new')],
			[match('first', 'name'), match('remembered', 'alias'), match('new', 'none')],
		)

		expect(sections.map(section => section.id)).toEqual(['fresh', 'matched'])
		expect(sections[1].lines.map(line => line.item.id)).toEqual(['first', 'remembered'])
		expect(sections[1].lines[0].remembered).toBe(false)
		expect(sections[1].lines[1].remembered).toBe(true)
		expect(sections[1].startsFolded).toBe(true)
	})

	it('omits empty sections and leaves the only matched section open', () => {
		const sections = buildReceiptTriage([item('one'), item('two')], [match('one', 'alias'), match('two', 'name')])

		expect(sections.map(section => section.id)).toEqual(['matched'])
		expect(sections[0].startsFolded).toBe(false)
	})

	it('preserves item order in every section and treats missing match data as new', () => {
		const sections = buildReceiptTriage([item('check', { price: null }), item('new-a'), item('matched'), item('new-b')], [match('check', 'none'), match('matched', 'name')])

		expect(sections.find(section => section.id === 'check')?.lines.map(line => line.item.id)).toEqual(['check'])
		expect(sections.find(section => section.id === 'fresh')?.lines.map(line => line.item.id)).toEqual(['new-a', 'new-b'])
	})
})

describe('buildReceiptTriage decisions', () => {
	const items = [item('proposal', { name: 'ORG BANANAS' }), item('other')]
	const matches = [match('proposal', 'none', { suggestion: ORGANIC }), match('other', 'name')]

	it('moves a line whose proposal was confirmed to the matched section, targeting the chosen item', () => {
		const sections = buildReceiptTriage(items, matches, decisions([['proposal', { kind: 'link', item: ORGANIC }]]))

		expect(sections.map(section => section.id)).toEqual(['matched'])
		const line = sections[0].lines.find(entry => entry.item.id === 'proposal')
		expect(line).toMatchObject({ badges: ['in-list'], proposal: null, target: ORGANIC, decision: { kind: 'link', item: ORGANIC } })
	})

	it('moves a line added as new to the new section', () => {
		const sections = buildReceiptTriage(items, matches, decisions([['proposal', { kind: 'new' }]]))

		expect(sections.map(section => section.id)).toEqual(['fresh', 'matched'])
		expect(sections[0].lines[0]).toMatchObject({ badges: ['new'], proposal: null, target: null, decision: { kind: 'new' } })
	})

	it('keeps a resolved line without a price in "needs a look" with only the missing price', () => {
		const sections = buildReceiptTriage(
			[item('proposal', { price: null })],
			[match('proposal', 'none', { suggestion: ORGANIC })],
			decisions([['proposal', { kind: 'link', item: ORGANIC }]]),
		)

		expect(sections.map(section => section.id)).toEqual(['check'])
		expect(sections[0].lines[0]).toMatchObject({ badges: ['in-list', 'no-price'], target: ORGANIC })
	})

	it('drops the "needs a look" section once its last pending line is resolved', () => {
		const pending = buildReceiptTriage(items, matches)
		const resolved = buildReceiptTriage(items, matches, decisions([['proposal', { kind: 'new' }]]))

		expect(pending.find(section => section.id === 'check')?.lines).toHaveLength(1)
		expect(resolved.find(section => section.id === 'check')).toBeUndefined()
	})

	it('ignores a decision for a line that has no proposal', () => {
		const sections = buildReceiptTriage(items, matches, decisions([['other', { kind: 'new' }]]))

		expect(sections.find(section => section.id === 'matched')?.lines[0]).toMatchObject({ decision: null, badges: ['in-list'] })
	})
})

describe('buildReceiptTriage categories', () => {
	it('splits every section by category and keeps receipt order inside each one', () => {
		const [section] = buildReceiptTriage(
			[
				item('apples', { category: 'Produce' }),
				item('soap', { category: 'Household' }),
				item('pears', { category: 'Produce' }),
			],
			[match('apples', 'none'), match('soap', 'none'), match('pears', 'none')],
		)

		expect(section.id).toBe('fresh')
		expect(section.categories.map(category => [category.title, category.lines.map(line => line.item.id)])).toEqual([
			['Household', ['soap']],
			['Produce', ['apples', 'pears']],
		])
		expect(section.lines.map(line => line.item.id)).toEqual(['apples', 'soap', 'pears'])
	})

	it('puts uncategorised lines under Other', () => {
		const [section] = buildReceiptTriage([item('mystery', { category: null })], [match('mystery', 'name')])

		expect(section.categories.map(category => category.title)).toEqual(['Other'])
	})
})
