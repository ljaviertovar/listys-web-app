import { describe, expect, it } from 'vitest'

import { createStoreSchema } from '../store'

describe('createStoreSchema', () => {
	it('accepts names with letters or numbers after the database normalization', () => {
		expect(createStoreSchema.safeParse({ name: 'Market #123' }).success).toBe(true)
	})

	it('explains when punctuation leaves no usable store name', () => {
		const result = createStoreSchema.safeParse({ name: '###' })
		expect(result.success).toBe(false)
		if (!result.success) expect(result.error.issues[0].message).toContain('at least one letter or number')
	})
})
