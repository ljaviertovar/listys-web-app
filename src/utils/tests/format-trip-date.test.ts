import { describe, expect, it } from 'vitest'
import { formatTripDate } from '../format-trip-date'

describe('trip calendar dates', () => {
	it('keeps the user’s shopping day near midnight UTC', () => {
		expect(formatTripDate(new Date('2026-02-20T02:30:00Z'), new Date('2026-11-05T15:00:00Z'), 'America/Toronto')).toBe('Thu 19 Feb')
	})
	it.each([
		[new Date(2026, 1, 19, 18, 40), 'Thu 19 Feb'],
		[new Date(2025, 1, 19, 18, 40), 'Wed 19 Feb 2025'],
		[new Date(2026, 1, 22), 'Sun 22 Feb'],
		[new Date(2026, 1, 19, 0, 0), 'Thu 19 Feb'],
	])('formats %s using its local calendar day', (date, expected) => {
		expect(formatTripDate(date, new Date(2026, 10, 5))).toBe(expected)
	})
})
