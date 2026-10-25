import { describe, expect, it } from 'vitest'

import { itemFormSchema, unitOptions } from '../helpers/item-form-schema'

const valid = { name: 'Orange Juice', quantity: 1, unit: 'pcs' }

describe('itemFormSchema', () => {
	it('accepts a plain item and trims its name', () => {
		const result = itemFormSchema.safeParse({ ...valid, name: '  Orange Juice  ', notes: '' })

		expect(result.success).toBe(true)
		expect(result.data?.name).toBe('Orange Juice')
	})

	it('says what is wrong in the words the form shows', () => {
		const messages = (input: unknown) => itemFormSchema.safeParse(input).error?.issues.map(issue => issue.message)

		expect(messages({ ...valid, name: '' })).toContain('Name is required')
		expect(messages({ ...valid, quantity: 0 })).toContain('Must be above 0')
		expect(messages({ ...valid, quantity: 100 })).toContain('Cannot exceed 99')
		expect(messages({ ...valid, quantity: 1.25 })).toContain('Use steps of 0.1')
		expect(messages({ ...valid, quantity: Number.NaN })).toContain('Quantity is required')
		expect(messages({ ...valid, unit: '' })).toContain('Unit is required')
	})
})

describe('unitOptions', () => {
	it('adds the unit an item came with when the list of units does not have it', () => {
		expect(unitOptions(['pcs', 'kg'], 'unit')).toEqual(['unit', 'pcs', 'kg'])
		expect(unitOptions(['pcs', 'kg'], 'kg')).toEqual(['pcs', 'kg'])
		expect(unitOptions(['pcs', 'kg'], null)).toEqual(['pcs', 'kg'])
	})
})
