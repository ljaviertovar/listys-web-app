import { describe, expect, it } from 'vitest'

import { buildNavCounts } from '@/components/app/sidebar/helpers/build-nav-counts'

describe('buildNavCounts', () => {
	it('puts the number of groups on Shopping List Groups and the receipts still waiting on Receipts', () => {
		expect(buildNavCounts({ groupsCount: 2, receiptsWaiting: 1 })).toEqual({
			'/shopping-lists': { value: 2, tone: 'neutral', label: '2 groups' },
			'/tickets': { value: 1, tone: 'waiting', label: '1 receipt waiting' },
		})
	})

	it('says "group" for one and "receipts" for several', () => {
		const counts = buildNavCounts({ groupsCount: 1, receiptsWaiting: 3 })

		expect(counts['/shopping-lists'].label).toBe('1 group')
		expect(counts['/tickets'].label).toBe('3 receipts waiting')
	})

	it('shows nothing for a zero or a count that has not loaded', () => {
		expect(buildNavCounts({ groupsCount: 0, receiptsWaiting: null })).toEqual({})
	})
})
