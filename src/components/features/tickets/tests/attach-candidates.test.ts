import { describe, expect, it } from 'vitest'

import { describeCandidate } from '../attach/helpers/attach-candidates'

const trip = (id: string, store: { id: string; name: string } | null) => ({
	id,
	name: 'Weekly shop',
	store,
	started_at: '2026-10-20T12:00:00.000Z',
	completed_at: '2026-10-20T13:00:00.000Z',
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
