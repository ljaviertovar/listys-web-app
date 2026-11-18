import { describe, expect, it } from 'vitest'

import { formatFirstReceipt } from '../helpers/format-first-receipt'

describe('formatFirstReceipt', () => {
	it('gives the month and year of the oldest receipt', () => {
		expect(formatFirstReceipt('2026-03-15T12:00:00Z')).toBe('Mar 2026')
	})

	it('gives nothing when there is no receipt or the date cannot be read', () => {
		expect(formatFirstReceipt(null)).toBeNull()
		expect(formatFirstReceipt(undefined)).toBeNull()
		expect(formatFirstReceipt('not a date')).toBeNull()
	})
})
