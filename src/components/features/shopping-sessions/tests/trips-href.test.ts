import { describe, expect, it } from 'vitest'

import { tripsHref } from '../helpers/trips-href'

describe('tripsHref', () => {
	it('opens all trips without a list', () => {
		expect(tripsHref()).toBe('/trips')
		expect(tripsHref(null)).toBe('/trips')
		expect(tripsHref('')).toBe('/trips')
	})

	it('narrows to a list and encodes it', () => {
		expect(tripsHref('list-1')).toBe('/trips?list=list-1')
		expect(tripsHref('a&b')).toBe('/trips?list=a%26b')
	})
})
