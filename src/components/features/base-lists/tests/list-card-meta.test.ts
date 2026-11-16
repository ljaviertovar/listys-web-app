import { describe, expect, it } from 'vitest'

import { buildListCardFacts, buildSharedWithLabel } from '../helpers/list-card-meta'

describe('buildListCardFacts', () => {
	it('says a list was never shopped when it has no completed trip', () => {
		expect(buildListCardFacts(null)).toEqual([{ value: 'No trips yet' }])
		expect(buildListCardFacts(undefined)).toEqual([{ value: 'No trips yet' }])
	})

	it('names the last trip without the year when it is this year, and without who the list is shared with', () => {
		const now = new Date(2026, 10, 16)

		expect(buildListCardFacts('2026-10-27T15:00:00.000Z', now)).toEqual([{ value: 'Last trip 27 Oct' }])
		expect(buildListCardFacts('2025-10-27T15:00:00.000Z', now)).toEqual([{ value: 'Last trip 27 Oct 2025' }])
	})
})

describe('buildSharedWithLabel', () => {
	it('has no label for a list that is not shared', () => {
		expect(buildSharedWithLabel(0)).toBeNull()
		expect(buildSharedWithLabel(undefined)).toBeNull()
	})

	it('counts the people the list is shared with', () => {
		expect(buildSharedWithLabel(2)).toBe('Shared with 2 people')
		expect(buildSharedWithLabel(1)).toBe('Shared with 1 person')
	})
})
