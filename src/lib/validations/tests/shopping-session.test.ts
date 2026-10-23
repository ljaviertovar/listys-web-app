import { describe, expect, it } from 'vitest'

import {
	COMPLETE_SESSION_ONLY_MESSAGE,
	completeShoppingSessionSchema,
	updateShoppingSessionSchema,
} from '../shopping-session'

describe('completeShoppingSessionSchema', () => {
	it.each([true, false])('accepts the deprecated sync_to_base flag set to %s', flag => {
		const result = completeShoppingSessionSchema.safeParse({ sync_to_base: flag })
		expect(result.success).toBe(true)
	})

	it('accepts an empty body, the total and notes', () => {
		expect(completeShoppingSessionSchema.safeParse({}).success).toBe(true)
		expect(completeShoppingSessionSchema.safeParse({ total_amount: 42.5, general_notes: 'Weekly' }).success).toBe(true)
	})

	it('still rejects an invalid total', () => {
		expect(completeShoppingSessionSchema.safeParse({ total_amount: -1 }).success).toBe(false)
	})
})

describe('updateShoppingSessionSchema', () => {
	it('rejects completing a session through a generic update and points to the complete operation', () => {
		const result = updateShoppingSessionSchema.safeParse({ status: 'completed' })
		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe(COMPLETE_SESSION_ONLY_MESSAGE)
	})

	it('keeps accepting name, notes and the active status', () => {
		expect(updateShoppingSessionSchema.safeParse({ name: 'Trip', general_notes: 'Notes' }).success).toBe(true)
		expect(updateShoppingSessionSchema.safeParse({ status: 'active' }).success).toBe(true)
	})

	it('does not carry sync_to_base through', () => {
		const result = updateShoppingSessionSchema.safeParse({ name: 'Trip', sync_to_base: false })
		expect(result.success).toBe(true)
		expect(result.data).toEqual({ name: 'Trip' })
	})
})
