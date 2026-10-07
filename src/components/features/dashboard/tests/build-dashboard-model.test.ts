import { describe, expect, it } from 'vitest'

import {
	buildDashboardModel,
	formatShortDate,
	pluralize,
	type DashboardModelInput,
} from '@/components/features/dashboard/helpers/build-dashboard-model'

const NOW = new Date('2026-02-19T15:00:00Z')

const walmart = { id: 'g1', name: 'Walmart', description: 'Weekly Groceries..', base_lists: [{ count: 2 }] }
const costco = { id: 'g2', name: 'Costco', description: null, base_lists: [{ count: 1 }] }

const noFrills = { id: 'l1', name: 'NO frills', group_id: 'g1', items: [{ count: 28 }] }
const weekly = { id: 'l2', name: 'Weekly Groceries', group_id: 'g1', items: [{ count: 19 }] }
const bulk = { id: 'l3', name: 'Monthly bulk', group_id: 'g2', items: [{ count: 0 }] }

function build(overrides: Partial<DashboardModelInput> = {}) {
	return buildDashboardModel({
		groups: [walmart, costco],
		baseLists: [noFrills, weekly, bulk],
		tickets: [],
		trips: [],
		activeSession: null,
		now: NOW,
		...overrides,
	})
}

describe('buildDashboardModel', () => {
	it('summarises the active session with its group, list and progress', () => {
		const model = build({
			activeSession: {
				id: 's1',
				name: 'Items for Dinner',
				base_list_id: 'l1',
				base_list: { group_id: 'g1', name: 'NO frills' },
				items: [{ checked: true }, { checked: true }, { checked: true }, ...Array.from({ length: 16 }, () => ({ checked: false }))],
				collaborators: [{ initials: 'MA' }],
			},
		})

		expect(model.activeSession).toMatchObject({
			name: 'Items for Dinner',
			groupName: 'Walmart',
			listName: 'NO frills',
			total: 19,
			checked: 3,
			remaining: 16,
			progress: 16,
		})
		expect(model.activeSession?.collaborators).toHaveLength(1)
	})

	it('returns no active session when there is none and guards an empty session against dividing by zero', () => {
		expect(build().activeSession).toBeNull()
		expect(build({ activeSession: { id: 's1', name: '', base_list_id: 'l1', items: [] } }).activeSession).toMatchObject({
			name: 'Current shopping',
			progress: 0,
			remaining: 0,
		})
	})

	it('nests each group’s lists with their item counts and caps the preview', () => {
		const many = Array.from({ length: 5 }, (_, i) => ({ id: `x${i}`, name: `List ${i}`, group_id: 'g1', items: [{ count: i }] }))
		const model = build({ baseLists: many })

		expect(model.groups[0].listsCount).toBe(5)
		expect(model.groups[0].lists).toHaveLength(3)
		expect(model.groups[0].hiddenListsCount).toBe(2)
		expect(model.counts.groups).toBe(2)
	})

	it('only offers lists that have items as quick-start options, with their group', () => {
		const model = build()

		expect(model.quickStart.map(list => list.name)).toEqual(['NO frills', 'Weekly Groceries'])
		expect(model.quickStart[0]).toMatchObject({ groupName: 'Walmart', itemsCount: 28 })
	})

	it('starts the first list with items from the hero when none is overdue', () => {
		expect(build().startTarget).toMatchObject({ name: 'NO frills', groupName: 'Walmart', itemsCount: 28 })
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
			href: '/tickets/t1',
		})
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
				{ id: 'h1', name: 'NO frills', base_list_id: 'l1', total_amount: 86.4, completed_at: '2026-02-14T10:00:00Z', purchased_count: 26, base_list: { name: 'NO frills', group: { id: 'g1', name: 'Walmart' } } },
				{ id: 'h2', name: 'Weekly Groceries', base_list_id: 'l2', total_amount: 64.12, completed_at: '2026-02-07T10:00:00Z', purchased_count: 19, base_list: { name: 'Weekly Groceries', group: { id: 'g1', name: 'Walmart' } } },
			],
		})

		expect(model.upNext).toEqual([
			expect.objectContaining({
				kind: 'list-stale',
				title: 'Weekly Groceries: last shopped 12 days ago',
				detail: 'Walmart · 19 items ready',
				href: '/base-lists/l2/edit',
			}),
		])
	})

	it('does not nag about lists that were shopped recently or never shopped', () => {
		expect(build().upNext).toEqual([])
	})

	it('previews trips with their group, date and total, and exposes the last trip', () => {
		const model = build({
			trips: [
				{ id: 'h1', name: 'NO frills', base_list_id: 'l1', total_amount: 86.4, completed_at: '2026-02-14T10:00:00Z', base_list: { name: 'NO frills', group: { id: 'g1', name: 'Walmart' } } },
			],
		})

		expect(model.trips[0]).toEqual({ id: 'h1', name: 'NO frills', meta: 'Walmart · 14 Feb', total: 86.4, href: '/shopping-history/g1' })
		expect(model.lastTrip).toEqual({ listName: 'NO frills', dateLabel: '14 Feb', total: 86.4 })
		expect(build().lastTrip).toBeNull()
	})

	it('maps OCR statuses to receipt previews', () => {
		const model = build({
			tickets: [
				{ id: 't1', store_name: 'v2', ocr_status: 'completed', total_items: 19, created_at: '2026-02-18T22:24:00Z', base_list_id: null },
				{ id: 't2', store_name: null, ocr_status: 'processing', total_items: null, created_at: null, base_list_id: null },
			],
		})

		expect(model.receipts[0]).toEqual({ id: 't1', title: 'v2', meta: '18 Feb · 19 items extracted', status: 'completed' })
		expect(model.receipts[1]).toMatchObject({ title: 'Store not recognized', status: 'processing' })
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
})
