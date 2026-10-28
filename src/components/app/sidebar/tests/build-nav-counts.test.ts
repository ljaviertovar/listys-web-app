import { describe, expect, it } from 'vitest'

import { buildNavCounts } from '@/components/app/sidebar/helpers/build-nav-counts'

describe('buildNavCounts', () => {
	it('puts the number of lists on Shopping Lists and the receipts still waiting on Receipts', () => {
		expect(buildNavCounts({ listsCount: 2, receiptsWaiting: 1 })).toEqual({
			'/shopping-lists': { value: 2, tone: 'neutral', label: '2 lists' },
			'/tickets': { value: 1, tone: 'waiting', label: '1 receipt waiting' },
		})
	})

	it('says "list" for one and "receipts" for several', () => {
		const counts = buildNavCounts({ listsCount: 1, receiptsWaiting: 3 })

		expect(counts['/shopping-lists'].label).toBe('1 list')
		expect(counts['/tickets'].label).toBe('3 receipts waiting')
	})

	it('shows nothing for a zero or a count that has not loaded', () => {
		expect(buildNavCounts({ listsCount: 0, receiptsWaiting: null })).toEqual({})
	})
})
