import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import type { LineDecision } from '../../add-to-list/helpers/merge-review'
import { buildReceiptTriage } from '../helpers/build-receipt-triage'
import { createReceiptDecisionsState, decisionsForList, receiptDecisionsReducer } from '../helpers/receipt-decisions-state'
import { TicketItemsList, type TicketItemsTriage } from '../ticket-items-list'
import type { TicketSelection } from '../hooks/use-ticket-selection'

// The wiring between a decision and what the screen shows: the real list is rendered before the decision, after it and after Undo.
const ORGANIC = { id: 'organic', name: 'Organic Bananas' }
const PANTRY = { id: 'pantry', name: 'Pantry' }

const item = (id: string, name: string, overrides: Partial<TicketItem> = {}): TicketItem => ({
	id, ticket_id: 't', name, category: 'Produce', price: 2, quantity: 1, unit: 'unit', created_at: null, normalized_name: null, shopping_session_item_id: null, ...overrides,
})
const items = [item('bananas', 'ORG BANANAS'), item('milk', 'Milk'), item('rice', 'Rice')]
const matches: TicketItemMatch[] = [
	{ ticket_item_id: 'bananas', match: 'none', base_list_item: null, suggestion: ORGANIC },
	{ ticket_item_id: 'milk', match: 'name', base_list_item: { id: 'base-milk', name: 'Milk' }, suggestion: null },
	{ ticket_item_id: 'rice', match: 'name', base_list_item: { id: 'base-rice', name: 'Rice' }, suggestion: null },
]

const selection = (selected: string[]): TicketSelection => ({
	selectedIds: new Set(selected),
	count: selected.length,
	total: 0,
	allSelected: false,
	partiallySelected: selected.length > 0,
	isSelected: id => selected.includes(id),
	toggle: () => {},
	selectMany: () => {},
	deselectMany: () => {},
	toggleAll: () => {},
	clear: () => {},
})

function render(decisions: ReadonlyMap<string, LineDecision>, selected: string[]) {
	const triage: TicketItemsTriage = {
		status: 'ready',
		baseList: PANTRY,
		baseLists: [PANTRY],
		triage: buildReceiptTriage(items, matches, decisions),
		matches,
		actions: { confirm: vi.fn(), addAsNew: vi.fn(), chooseAnother: vi.fn(), linkDialog: { lineName: null, currentItemId: null, items: [], onClose: vi.fn(), onLink: vi.fn() } },
		changeList: vi.fn(),
		retry: vi.fn(),
	}
	return renderToStaticMarkup(createElement(TicketItemsList, { items, selection: selection(selected), canSelect: true, triage }))
}

const decide = (decision: LineDecision | null) =>
	decisionsForList(receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: PANTRY.id, itemId: 'bananas', decision }), PANTRY.id)

describe('deciding a proposed match on the receipt screen', () => {
	const before = render(new Map(), [])
	const confirmed = render(decide({ kind: 'link', item: ORGANIC }), [])

	it('starts with the proposal pending and its three ways to settle it', () => {
		expect(before).toContain('Needs a look')
		expect(before).toContain('Confirm match')
		expect(before).toContain('Possible match:')
		expect(before).toMatch(/Confirm Match[\s\S]*Choose Another[\s\S]*Add as New/)
	})

	it('moves the confirmed line out of "Needs a look" and into "Matched to", with its outcome and Change', () => {
		expect(confirmed).not.toContain('Needs a look')
		expect(confirmed).toContain('Matched to Pantry')
		expect(confirmed).toContain('3 items')
		expect(confirmed).toContain('Matches')
		expect(confirmed).toContain('Change')
		expect(confirmed).not.toContain('Confirm match')
	})

	it('puts a line added as new in "New to" and shows what it will do', () => {
		const asNew = render(decide({ kind: 'new' }), [])

		expect(asNew).toContain('New to Pantry')
		expect(asNew).toContain('Adds as new item')
		expect(asNew).not.toContain('Needs a look')
	})

	it('leaves inclusion alone: a line is as included after the decision as it was before', () => {
		const includedBefore = render(new Map(), ['bananas'])
		const includedAfter = render(decide({ kind: 'link', item: ORGANIC }), ['bananas'])
		const notIncluded = render(decide({ kind: 'link', item: ORGANIC }), [])

		expect(includedBefore).toContain('data-selected="true"')
		expect(includedAfter).toContain('data-selected="true"')
		expect(notIncluded).not.toContain('data-selected="true"')
	})

	it('gives the screen back exactly as it was when the decision is undone', () => {
		const undone = render(decide(null), [])

		expect(undone).toBe(before)
	})
})
