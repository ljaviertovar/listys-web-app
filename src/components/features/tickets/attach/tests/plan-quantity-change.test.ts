import { describe, expect, it } from 'vitest'
import { planQuantityChange } from '../helpers/plan-quantity-change'

const item = { id: 'milk', name: 'Milk', checked: false, quantity: 2, unit: 'each' }

describe('purchased quantity plan', () => {
	it.each([
		[[{ quantity: 3 }], { before: 2, after: 3 }],
		[[{ quantity: 1 }], { before: 2, after: 1 }],
		[[{ quantity: 2 }, { quantity: 1 }], { before: 2, after: 3 }],
		[[{ quantity: 1, unit: 'kg' }, { quantity: 1, unit: 'each' }], null],
		[[{ quantity: 2 }], null],
		[[{}], { before: 2, after: 1 }],
	] as const)('mirrors the RPC for %j', (lines, expected) => {
		expect(planQuantityChange(item, [...lines])).toEqual(expected)
	})
})
