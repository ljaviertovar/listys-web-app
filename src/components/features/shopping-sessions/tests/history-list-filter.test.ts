import { describe, expect, it } from 'vitest'

import { historyFilterHref } from '../helpers/history-filter-href'

describe('historyFilterHref', () => {
	it('puts the chosen list in the URL', () => {
		expect(historyFilterHref('/shopping-history', '', 'b')).toBe('/shopping-history?list=b')
	})

	it('replaces a previous choice and keeps unrelated params', () => {
		expect(historyFilterHref('/shopping-history', 'list=a&x=1', 'b')).toBe('/shopping-history?list=b&x=1')
	})

	it('drops the param for every list so the URL is clean again', () => {
		expect(historyFilterHref('/shopping-history', 'list=a', 'all')).toBe('/shopping-history')
		expect(historyFilterHref('/shopping-history', 'list=a&x=1', 'all')).toBe('/shopping-history?x=1')
	})
})
