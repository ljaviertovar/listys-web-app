import { describe, expect, it } from 'vitest'

import {
	buildDashboardModel,
	currentMonthRange,
	formatCadence,
	formatShortDate,
	pluralize,
	type DashboardModelInput,
} from '@/components/features/dashboard/helpers/build-dashboard-model'

const NOW = new Date('2026-02-19T15:00:00Z')

const noFrills = { id: 'l1', name: 'NO frills', created_at: '2026-01-01T00:00:00Z', items: [{ count: 28 }] }
const weekly = { id: 'l2', name: 'Weekly Groceries', created_at: '2026-01-02T00:00:00Z', items: [{ count: 19 }] }
const bulk = { id: 'l3', name: 'Monthly bulk', created_at: '2026-01-03T00:00:00Z', items: [{ count: 0 }] }

function build(overrides: Partial<DashboardModelInput> = {}) {
	return buildDashboardModel({
		baseLists: [noFrills, weekly, bulk],
		tickets: [],
		trips: [],
		activeSession: null,
		now: NOW,
		...overrides,
	})
}

describe('buildDashboardModel', () => {
	it('summarises the active session with its list and progress', () => {
		const model = build({
			activeSession: {
				id: 's1',
				name: 'Items for Dinner',
				base_list_id: 'l1',
				base_list: { name: 'NO frills' },
				items: [{ checked: true }, { checked: true }, { checked: true }, ...Array.from({ length: 16 }, () => ({ checked: false }))],
				collaborators: [{ initials: 'MA' }],
			},
		})

		expect(model.activeSession).toMatchObject({
			name: 'Items for Dinner',
			listName: 'NO frills',
			total: 19,
			checked: 3,
			remaining: 16,
			progress: 16,
		})
		expect(model.activeSession?.collaborators).toHaveLength(1)
		expect(model.activeSession).not.toHaveProperty('groupName')
	})

	it('returns no active session when there is none and guards an empty session against dividing by zero', () => {
		expect(build().activeSession).toBeNull()
		expect(build({ activeSession: { id: 's1', name: '', base_list_id: 'l1', items: [] } }).activeSession).toMatchObject({
			name: 'Current shopping',
			progress: 0,
			remaining: 0,
		})
	})

	it('keeps the newest session in the hero and exposes every active list session', () => {
		const model = build({
			activeSessions: [
				{ id: 's2', name: 'Recent trip', base_list_id: 'l2', items: [{ checked: true }] },
				{ id: 's1', name: 'Earlier trip', base_list_id: 'l1', items: [] },
			],
		})

		expect(model.activeSession?.id).toBe('s2')
		expect(model.activeSessionIds).toEqual({ l2: 's2', l1: 's1' })
		expect(model.otherSessionCount).toBe(1)
	})

	it('lists the lists flat with their item counts and caps the preview', () => {
		const many = Array.from({ length: 7 }, (_, i) => ({ id: `x${i}`, name: `List ${i}`, items: [{ count: i }] }))
		const model = build({ baseLists: many })

		expect(model.lists.items).toHaveLength(5)
		expect(model.lists.items[2]).toEqual({ id: 'x2', name: 'List 2', itemsCount: 2 })
		expect(model.lists.hiddenCount).toBe(2)
		expect(model).not.toHaveProperty('groups')
		expect(model).not.toHaveProperty('counts')
	})

	it('shows every list when they fit, with nothing hidden', () => {
		expect(build().lists).toEqual({
			items: [
				{ id: 'l1', name: 'NO frills', itemsCount: 28 },
				{ id: 'l2', name: 'Weekly Groceries', itemsCount: 19 },
				{ id: 'l3', name: 'Monthly bulk', itemsCount: 0 },
			],
			hiddenCount: 0,
		})
	})

	it('names lists that share a name apart everywhere, oldest first', () => {
		const older = { id: 'a', name: 'Weekly', created_at: '2026-01-01T00:00:00Z', items: [{ count: 4 }] }
		const newer = { id: 'b', name: 'Weekly', created_at: '2026-02-01T00:00:00Z', items: [{ count: 6 }] }
		const model = build({
			baseLists: [newer, older],
			trips: [{ id: 'h1', name: 'Weekly', base_list_id: 'b', total_amount: 10, completed_at: '2026-01-20T10:00:00Z', base_list: { name: 'Weekly' } }],
			activeSession: { id: 's1', name: '', base_list_id: 'b', base_list: { name: 'Weekly' }, items: [] },
		})

		expect(model.lists.items.map(list => list.name)).toEqual(['Weekly (2)', 'Weekly'])
		expect(model.quickStart.map(list => list.name)).toEqual(['Weekly (2)', 'Weekly'])
		expect(model.activeSession?.listName).toBe('Weekly (2)')
		expect(model.lastTrip?.listName).toBe('Weekly (2)')
		expect(model.lastTrip?.listName).toBe('Weekly (2)')
	})

	it('only offers lists that have items as quick-start options', () => {
		const model = build()

		expect(model.quickStart.map(list => list.name)).toEqual(['NO frills', 'Weekly Groceries'])
		expect(model.quickStart[0]).toEqual({ id: 'l1', name: 'NO frills', itemsCount: 28 })
	})

	it('starts the first list with items from the hero when none is overdue', () => {
		expect(build().startTarget).toEqual({ id: 'l1', name: 'NO frills', itemsCount: 28 })
	})

	it('points the hero at the only list when it is empty, like a new account’s Pantry', () => {
		const pantry = { id: 'p1', name: 'Pantry', items: [{ count: 0 }] }
		const model = build({ baseLists: [pantry] })

		expect(model.addItemsTarget).toEqual({ id: 'p1', name: 'Pantry' })
		expect(model.startTarget).toBeNull()
		expect(model.quickStart).toEqual([])
		expect(model.lists.items).toEqual([{ id: 'p1', name: 'Pantry', itemsCount: 0 }])
	})

	it('has no add-items target once the only list has items or the account has several lists', () => {
		expect(build({ baseLists: [noFrills] }).addItemsTarget).toBeNull()
		expect(build({ baseLists: [bulk, { ...bulk, id: 'l9', name: 'Other' }] }).addItemsTarget).toBeNull()
		expect(build({ baseLists: [] }).addItemsTarget).toBeNull()
	})

	it('flags a processed receipt that is not in a list yet', () => {
		const model = build({
			tickets: [
				{ id: 't1', store_name: 'Grocery', ocr_status: 'completed', total_items: 28, created_at: '2026-02-17T04:16:00Z', base_list_id: null },
				{ id: 't2', store_name: 'v2', ocr_status: 'completed', total_items: 19, created_at: '2026-02-18T22:24:00Z', base_list_id: 'l1' },
			],
		})

		expect(model.upNext).toHaveLength(1)
		expect(model.upNext[0]).toMatchObject({
			kind: 'receipt-waiting',
			title: '28 items from “Grocery” are waiting',
			detail: 'Add them to one of your lists',
			href: '/tickets/t1',
		})
		expect(JSON.stringify(model.upNext)).not.toMatch(/group/i)
	})

	it('titles a receipt with its confirmed store rather than the raw name', () => {
		const model = build({
			tickets: [
				{ id: 't1', store_name: 'NOFRILLS #3127', store: { name: 'No Frills' }, ocr_status: 'completed', total_items: 3, created_at: null, base_list_id: null },
			],
		})

		expect(model.upNext[0].title).toBe('3 items from “No Frills” are waiting')
	})

	it('uses a safe name when OCR did not recognise the store and a failed receipt gets a recovery hint', () => {
		const model = build({
			tickets: [
				{ id: 't1', store_name: null, ocr_status: 'completed', total_items: 1, created_at: null, base_list_id: null },
				{ id: 't2', store_name: null, ocr_status: 'failed', total_items: null, created_at: null, base_list_id: null },
			],
		})

		expect(model.upNext[0].title).toBe('1 item from “Store not recognized” is waiting')
		expect(model.upNext[1]).toMatchObject({ kind: 'receipt-failed', detail: 'Open it to try again or upload a clearer photo' })
	})

	it('points to the most overdue list that has been shopped before', () => {
		const model = build({
			trips: [
				{ id: 'h1', name: 'NO frills', base_list_id: 'l1', total_amount: 86.4, completed_at: '2026-02-14T10:00:00Z', purchased_count: 26, base_list: { name: 'NO frills' } },
				{ id: 'h2', name: 'Weekly Groceries', base_list_id: 'l2', total_amount: 64.12, completed_at: '2026-02-07T10:00:00Z', purchased_count: 19, base_list: { name: 'Weekly Groceries' } },
			],
		})

		expect(model.upNext).toEqual([
			expect.objectContaining({
				kind: 'list-stale',
				title: 'Weekly Groceries: last shopped 12 days ago',
				detail: '19 items ready',
				href: '/base-lists/l2/edit',
			}),
		])
	})

	it('does not nag about lists that were shopped recently or never shopped', () => {
		expect(build().upNext).toEqual([])
	})

	it('exposes the last trip for the hero', () => {
		const model = build({
			trips: [
				{ id: 'h1', name: 'NO frills', base_list_id: 'l1', total_amount: 86.4, completed_at: '2026-02-14T10:00:00Z', base_list: { name: 'NO frills' } },
			],
		})

		expect(model.lastTrip).toEqual({ listName: 'NO frills', dateLabel: '14 Feb', total: 86.4 })
		expect(build().lastTrip).toBeNull()
	})

	it('builds likely-needed explanations and recent store visits with the right destination', () => {
		const model = build({
			likelyNeeded: [{ id: 'i1', name: 'Milk', base_list: { id: 'l1', name: 'Pantry' }, usual_store: { id: 's1', name: 'Metro' }, interval_days: 9.4, days_since: 12 }],
			likelyNeededHasHistory: true,
			stores: [
				{ id: 's1', name: 'Metro', last_visit: { kind: 'trip', id: 'trip-1', at: '2026-02-18T22:24:00Z', total_amount: 84.2 } },
				{ id: 's2', name: 'Costco', last_visit: { kind: 'receipt', id: 'ticket-1', at: '2026-02-12T10:00:00Z', total_amount: null } },
			],
		})
		expect(model.likelyNeeded).toEqual({ hasHistory: true, items: [{
			id: 'i1', name: 'Milk', base_list: { id: 'l1', name: 'Pantry' }, usual_store: { id: 's1', name: 'Metro' },
			interval_days: 9.4, days_since: 12, cadence: 'Usually every 9 days · last bought 12 days ago',
		}] })
		expect(model.storeVisits).toEqual([
			{ storeId: 's1', storeName: 'Metro', kind: 'trip', id: 'trip-1', dateLabel: '18 Feb', total: 84.2, href: '/shopping-history' },
			{ storeId: 's2', storeName: 'Costco', kind: 'receipt', id: 'ticket-1', dateLabel: '12 Feb', total: null, href: '/tickets/ticket-1' },
		])
	})
})

describe('helpers', () => {
	it('pluralizes by count', () => {
		expect(pluralize(1, 'item')).toBe('1 item')
		expect(pluralize(0, 'item')).toBe('0 items')
		expect(pluralize(2, 'day')).toBe('2 days')
	})

	it('formats short dates and tolerates missing or invalid values', () => {
		expect(formatShortDate('2026-02-14T10:00:00Z')).toBe('14 Feb')
		expect(formatShortDate(null)).toBe('')
		expect(formatShortDate('not-a-date')).toBe('')
	})

	it('formats cadence with rounded days and correct singulars', () => {
		expect(formatCadence(9.4, 1)).toBe('Usually every 9 days · last bought 1 day ago')
		expect(formatCadence(0.4, 0)).toBe('Usually every 1 day · last bought 0 days ago')
	})

	it('calculates visitor-local month boundaries across zones, month edges, and DST', () => {
		expect(currentMonthRange(new Date('2026-10-15T12:00:00Z'), 'UTC')).toEqual({ from: '2026-10-01T00:00:00.000Z', to: '2026-11-01T00:00:00.000Z' })
		expect(currentMonthRange(new Date('2026-10-15T12:00:00Z'), 'Asia/Tokyo')).toEqual({ from: '2026-09-30T15:00:00.000Z', to: '2026-10-31T15:00:00.000Z' })
		expect(currentMonthRange(new Date('2026-11-01T03:30:00Z'), 'America/Toronto')).toEqual({ from: '2026-10-01T04:00:00.000Z', to: '2026-11-01T04:00:00.000Z' })
		expect(currentMonthRange(new Date('2026-03-15T12:00:00Z'), 'America/Toronto')).toEqual({ from: '2026-03-01T05:00:00.000Z', to: '2026-04-01T04:00:00.000Z' })
	})
})
