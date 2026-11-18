import { describe, expect, it } from 'vitest'

import { isSpendableReceipt } from '../spending-receipt'

describe('isSpendableReceipt', () => {
	it('counts a completed receipt when priced lines support its total within tax and rounding tolerance', () => {
		expect(isSpendableReceipt('completed', 108, [{ price: 100, quantity: 1 }])).toBe(true)
	})

	it('excludes a plausible looking OCR result when its lines cannot support the reported total', () => {
		expect(isSpendableReceipt('completed', 273, [{ price: 13, quantity: 1 }])).toBe(false)
	})

	it('excludes failed, unpriced, missing-total, and non-finite readings', () => {
		expect(isSpendableReceipt('failed', 10, [{ price: 10, quantity: 1 }])).toBe(false)
		expect(isSpendableReceipt('completed', 10, [{ price: null, quantity: 1 }])).toBe(false)
		expect(isSpendableReceipt('completed', null, [{ price: 10, quantity: 1 }])).toBe(false)
		expect(isSpendableReceipt('completed', Number.NaN, [{ price: 10, quantity: 1 }])).toBe(false)
	})
})
