import { describe, expect, it } from 'vitest'

import { isUsablePrice } from '@/utils/is-usable-price'

describe('isUsablePrice', () => {
	it('accepts a positive finite number', () => {
		expect(isUsablePrice(3.49)).toBe(true)
		expect(isUsablePrice(0.01)).toBe(true)
	})

	it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, null, undefined])('rejects %s', value => {
		expect(isUsablePrice(value)).toBe(false)
	})
})
