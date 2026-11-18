import { describe, expect, it } from 'vitest'

import { describeEstimateBasis } from '../helpers/describe-estimate-basis'

describe('describeEstimateBasis', () => {
	it('is one line when every checked item has a price', () => {
		expect(describeEstimateBasis({ itemCount: 1, pricedCount: 1 })).toEqual(['Based on 1 checked item'])
		expect(describeEstimateBasis({ itemCount: 23, pricedCount: 23 })).toEqual(['Based on 23 checked items'])
	})

	it('adds what is missing only when some checked items have no price', () => {
		expect(describeEstimateBasis({ itemCount: 23, pricedCount: 19 })).toEqual(['Based on 19 of 23 checked items', '4 without a price yet'])
	})

	it('does not compare numbers when nothing is priced or nothing is checked', () => {
		expect(describeEstimateBasis({ itemCount: 2, pricedCount: 0 })).toEqual(['No known prices for the checked items'])
		expect(describeEstimateBasis({ itemCount: 0, pricedCount: 0 })).toEqual(['Nothing checked yet'])
	})
})
