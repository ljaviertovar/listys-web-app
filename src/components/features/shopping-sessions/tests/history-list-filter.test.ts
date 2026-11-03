import { describe, expect, it } from 'vitest'

import { historyFilterHref } from '../helpers/history-filter-href'

describe('historyFilterHref', () => {
	it('puts the chosen list in the URL', () => {
		expect(historyFilterHref('/trips', '', 'b')).toBe('/trips?list=b')
	})

	it('replaces a previous choice and keeps unrelated params', () => {
		expect(historyFilterHref('/trips', 'list=a&x=1', 'b')).toBe('/trips?list=b&x=1')
	})

	it('drops the param for every list so the URL is clean again', () => {
		expect(historyFilterHref('/trips', 'list=a', 'all')).toBe('/trips')
		expect(historyFilterHref('/trips', 'list=a&x=1', 'all')).toBe('/trips?x=1')
	})
})
