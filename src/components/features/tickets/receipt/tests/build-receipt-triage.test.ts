import { describe, expect, it } from 'vitest'

import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

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
		normalized_name: null,
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

describe('buildReceiptTriage', () => {
	it('puts check lines first with both reasons when price and a similar item are missing/available', () => {
		const sections = buildReceiptTriage(
			[item('new', { name: 'ORG BANANAS', price: null }), item('fresh'), item('matched')],
			[
				match('new', 'none', { suggestion: { id: 'organic', name: 'Organic Bananas' } }),
				match('fresh', 'none'),
				match('matched', 'name'),
			],
		)

		expect(sections.map(section => [section.id, section.lines.length, section.startsFolded])).toEqual([
			['check', 1, false],
			['fresh', 1, false],
			['matched', 1, true],
		])
		expect(sections[0].lines[0].reasons).toEqual(['No price read', 'Looks like Organic Bananas?'])
	})

	it('marks a no-price line for review even when it matches by name', () => {
		const [section] = buildReceiptTriage([item('yogurt', { price: null })], [match('yogurt', 'name')])

		expect(section.id).toBe('check')
		expect(section.lines[0].reasons).toEqual(['No price read'])
	})

	it('marks a similar unmatched line for review without changing its match', () => {
		const [section] = buildReceiptTriage(
			[item('bananas', { name: 'ORG BANANAS' })],
			[match('bananas', 'none', { suggestion: { id: 'organic', name: 'Organic Bananas' } })],
		)

		expect(section.id).toBe('check')
		expect(section.lines[0].reasons).toEqual(['Looks like Organic Bananas?'])
		expect(section.lines[0].match?.match).toBe('none')
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
