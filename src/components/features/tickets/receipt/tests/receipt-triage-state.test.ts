import { describe, expect, it } from 'vitest'

import { createReceiptTriageState, receiptTriageReducer } from '../helpers/receipt-triage-state'
import { createEmptyTicketSelection } from '../hooks/use-ticket-selection'
import { receiptBulkSelectionIds, receiptItemsView } from '../helpers/receipt-triage-view'
import { mergeTicketSelection, removeFromTicketSelection } from '../helpers/ticket-selection-state'
import type { ReceiptTriageSection } from '../helpers/build-receipt-triage'
import type { ReceiptTriageStatus } from '../helpers/build-receipt-triage'

describe('receipt triage state', () => {
	it('starts loading for an eligible receipt and unavailable for other receipts', () => {
		expect(createReceiptTriageState(true).status).toBe('loading')
		expect(createReceiptTriageState(false)).toMatchObject({ status: 'unavailable', baseList: null, baseLists: [], matches: [] })
	})

	it('moves from loading to ready with only the supplied target and owned list choices', () => {
		const state = receiptTriageReducer(createReceiptTriageState(true), {
			type: 'ready',
			baseList: { id: 'own-1', name: 'Pantry' },
			baseLists: [{ id: 'own-1', name: 'Pantry' }],
			matches: [],
		})

		expect(state).toMatchObject({ status: 'ready', baseList: { id: 'own-1' }, baseLists: [{ id: 'own-1' }], matches: [] })
	})

	it('returns to loading for a retry and exposes failure without losing list choices', () => {
		const ready = receiptTriageReducer(createReceiptTriageState(true), {
			type: 'ready', baseList: { id: 'list-1', name: 'Pantry' }, baseLists: [{ id: 'list-1', name: 'Pantry' }], matches: [],
		})
		const loading = receiptTriageReducer(ready, { type: 'loading' })
		const failed = receiptTriageReducer(loading, { type: 'failed' })

		expect(loading.status).toBe('loading')
		expect(failed).toMatchObject({ status: 'failed', baseLists: [{ id: 'list-1' }] })
	})

	it('does not preselect any receipt lines when triage becomes ready', () => {
		const state = receiptTriageReducer(createReceiptTriageState(true), {
			type: 'ready', baseList: { id: 'list-1', name: 'Pantry' }, baseLists: [{ id: 'list-1', name: 'Pantry' }], matches: [],
		})

		expect(state).not.toHaveProperty('selectedIds')
		expect(createEmptyTicketSelection().size).toBe(0)
	})

	it('keeps the triage view while loading, and uses categories when comparison is unavailable', () => {
		expect(receiptItemsView('loading')).toBe('triage')
		expect((['failed', 'unavailable'] as ReceiptTriageStatus[]).map(receiptItemsView)).toEqual(['categories', 'categories'])
		expect(receiptItemsView('ready')).toBe('triage')
		expect(receiptItemsView('switching')).toBe('triage')
	})

	it('switches to another list keeping the choices, and a failed switch still points at the list that was asked for', () => {
		const pantry = { id: 'list-1', name: 'Pantry' }
		const office = { id: 'list-2', name: 'Office' }
		const ready = receiptTriageReducer(createReceiptTriageState(true), { type: 'ready', baseList: pantry, baseLists: [pantry, office], matches: [] })

		const switching = receiptTriageReducer(ready, { type: 'switching', baseList: office })
		const failed = receiptTriageReducer(switching, { type: 'failed' })

		expect(switching).toMatchObject({ status: 'switching', baseList: office, baseLists: [pantry, office] })
		expect(failed).toMatchObject({ status: 'failed', baseList: office, baseLists: [pantry, office] })
	})

	it('bulk selects only matched rows and category-view selection remains additive', () => {
		const sections = [
			{ id: 'check', lines: [{ item: { id: 'check-1' } }] },
			{ id: 'matched', lines: [{ item: { id: 'matched-1' } }, { item: { id: 'matched-2' } }] },
		] as ReceiptTriageSection[]

		expect(receiptBulkSelectionIds(sections, 'check')).toEqual([])
		expect(receiptBulkSelectionIds(sections, 'matched')).toEqual(['matched-1', 'matched-2'])
		expect(mergeTicketSelection(new Set(['category-selected']), receiptBulkSelectionIds(sections, 'matched'))).toEqual(
			new Set(['category-selected', 'matched-1', 'matched-2']),
		)
	})
})

describe('accepting matched lines and undoing it', () => {
	it('gives back only the accepted lines and keeps whatever else was selected', () => {
		const selected = mergeTicketSelection(new Set(['category-selected']), ['matched-1', 'matched-2'])

		expect(removeFromTicketSelection(selected, ['matched-1', 'matched-2'])).toEqual(new Set(['category-selected']))
		expect(removeFromTicketSelection(new Set(['a']), ['missing'])).toEqual(new Set(['a']))
	})
})
