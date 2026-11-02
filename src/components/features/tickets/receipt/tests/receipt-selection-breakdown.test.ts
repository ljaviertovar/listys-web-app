import { describe, expect, it } from 'vitest'

import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import type { LineDecision } from '../../add-to-list/helpers/merge-review'
import { buildReceiptTriage } from '../helpers/build-receipt-triage'
import { buildSelectionBreakdown } from '../helpers/receipt-selection-breakdown'

const item = (id: string, overrides: Partial<TicketItem> = {}): TicketItem => ({
	id, ticket_id: 't', name: id, category: 'Other', price: 1, quantity: 1, unit: 'unit', created_at: null, normalized_name: null, ...overrides,
})
const match = (id: string, kind: TicketItemMatch['match'], suggestion: TicketItemMatch['suggestion'] = null): TicketItemMatch => ({
	ticket_item_id: id, match: kind, base_list_item: kind === 'none' ? null : { id: `base-${id}`, name: id }, suggestion,
})

const ORGANIC = { id: 'organic', name: 'Organic Bananas' }
const items = [item('name'), item('alias'), item('fresh'), item('proposal'), item('skipped')]
const matches = [match('name', 'name'), match('alias', 'alias'), match('fresh', 'none'), match('proposal', 'none', ORGANIC), match('skipped', 'name')]
const all = new Set(['name', 'alias', 'fresh', 'proposal'])

describe('buildSelectionBreakdown', () => {
	it('splits the included lines into those that add an item and those that update one', () => {
		const sections = buildReceiptTriage(items, matches)

		expect(buildSelectionBreakdown(sections, all)).toEqual({ added: 2, updated: 2 })
	})

	it('counts a confirmed proposal as an update, and a proposal nobody confirmed as new', () => {
		const confirmed = new Map<string, LineDecision>([['proposal', { kind: 'link', item: ORGANIC }]])

		expect(buildSelectionBreakdown(buildReceiptTriage(items, matches, confirmed), all)).toEqual({ added: 1, updated: 3 })
		expect(buildSelectionBreakdown(buildReceiptTriage(items, matches), new Set(['proposal']))).toEqual({ added: 1, updated: 0 })
	})

	it('counts only the lines that are included', () => {
		expect(buildSelectionBreakdown(buildReceiptTriage(items, matches), new Set())).toEqual({ added: 0, updated: 0 })
	})

	it('has nothing to say without a comparison', () => {
		expect(buildSelectionBreakdown([], all)).toBeNull()
	})
})
