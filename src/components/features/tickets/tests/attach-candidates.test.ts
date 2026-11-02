import { describe, expect, it } from 'vitest'

import { describeCandidate, sortCandidatesByStore } from '../attach/helpers/attach-candidates'

const trip = (id: string, store: { id: string; name: string } | null) => ({
	id,
	name: 'Weekly shop',
	store,
	started_at: '2026-10-20T12:00:00.000Z',
	completed_at: '2026-10-20T13:00:00.000Z',
})

describe('sortCandidatesByStore', () => {
	it('puts trips at the receipt store, or with no store yet, before trips at another store and keeps the rest in order', () => {
		const sorted = sortCandidatesByStore(
			[trip('a', { id: 'other', name: 'Costco' }), trip('b', { id: 'mine', name: 'Metro' }), trip('c', null), trip('d', { id: 'other', name: 'Costco' })],
			'mine',
		)

		expect(sorted.map(candidate => candidate.id)).toEqual(['b', 'c', 'a', 'd'])
	})

	it('leaves the order alone when the receipt has no store', () => {
		const candidates = [trip('a', { id: 'other', name: 'Costco' }), trip('b', null)]

		expect(sortCandidatesByStore(candidates, null)).toBe(candidates)
	})
})

describe('describeCandidate', () => {
	it('tells trips apart by name, date and store', () => {
		const text = describeCandidate(trip('a', { id: 'mine', name: 'Metro' }))

		expect(text.startsWith('Weekly shop · ')).toBe(true)
		expect(text.endsWith(' · Metro')).toBe(true)
	})

	it('skips the parts a trip does not have', () => {
		expect(describeCandidate({ name: 'Weekly shop', store: null, started_at: null, completed_at: null })).toBe('Weekly shop')
	})
})
