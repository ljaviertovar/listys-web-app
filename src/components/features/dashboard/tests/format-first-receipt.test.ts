import { describe, expect, it } from 'vitest'

import { formatFirstReceipt, formatLastReceipt } from '../helpers/format-first-receipt'

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

describe('formatLastReceipt', () => {
	const now = new Date('2026-11-18T12:00:00')

	it('gives the day of the newest receipt, with the year only when it is not this year', () => {
		expect(formatLastReceipt('2026-10-28T12:00:00', now)).toBe('Oct 28')
		expect(formatLastReceipt('2025-12-30T12:00:00', now)).toBe('Dec 30, 2025')
	})

	it('gives nothing when there is no receipt or the date cannot be read', () => {
		expect(formatLastReceipt(null, now)).toBeNull()
		expect(formatLastReceipt('not a date', now)).toBeNull()
	})
})
