import { describe, expect, it } from 'vitest'

import { buildHistoryView } from '../helpers/build-history-view'

const trips = [
	{ id: 't1', base_list_id: 'a' },
	{ id: 't2', base_list_id: 'b' },
	{ id: 't3', base_list_id: 'a' },
]
const lists = [
	{ id: 'a', name: 'Pantry', created_at: '2026-01-01T00:00:00Z' },
	{ id: 'b', name: 'Costco', created_at: '2026-01-02T00:00:00Z' },
	{ id: 'c', name: 'Camping', created_at: '2026-01-03T00:00:00Z' },
]

describe('buildHistoryView', () => {
	it('shows every trip and offers only the lists that have trips, sorted by name', () => {
		const view = buildHistoryView({ trips, lists })

		expect(view.trips.map(trip => trip.id)).toEqual(['t1', 't2', 't3'])
		expect(view.options).toEqual([
			{ id: 'b', name: 'Costco' },
			{ id: 'a', name: 'Pantry' },
		])
		expect(view.selectedListId).toBeNull()
	})

	it('narrows to the chosen list, keeping the order of the trips', () => {
		const view = buildHistoryView({ trips, lists, listParam: 'a' })

		expect(view.selectedListId).toBe('a')
		expect(view.trips.map(trip => trip.id)).toEqual(['t1', 't3'])
	})

	it('falls back to all trips for a value that is unknown, empty, or a list without trips', () => {
		for (const listParam of ['nope', '', null, undefined, 'c']) {
			const view = buildHistoryView({ trips, lists, listParam })
			expect(view.selectedListId).toBeNull()
			expect(view.trips).toHaveLength(3)
		}
	})

	it('names same-named lists as the lists screen does, even when only the newer one has trips', () => {
		const view = buildHistoryView({
			trips: [{ id: 't1', base_list_id: 'new' }],
			lists: [
				{ id: 'old', name: 'Weekly', created_at: '2026-01-01T00:00:00Z' },
				{ id: 'new', name: 'Weekly', created_at: '2026-02-01T00:00:00Z' },
			],
		})

		expect(view.options).toEqual([{ id: 'new', name: 'Weekly (2)' }])
	})

	it('has no options and no trips for an account without history', () => {
		expect(buildHistoryView({ trips: [], lists })).toEqual({ options: [], selectedListId: null, trips: [] })
	})
})
