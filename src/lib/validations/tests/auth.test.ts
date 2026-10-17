import { describe, expect, it } from 'vitest'

import { signInSchema, signUpSchema } from '../auth'

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
	result.error?.issues.map(issue => issue.message) ?? []

describe('signInSchema', () => {
	it('accepts an email and any non-empty password, trimming the email', () => {
		const result = signInSchema.safeParse({ email: '  maria@example.com ', password: 'x' })
		expect(result.success).toBe(true)
		expect(result.data?.email).toBe('maria@example.com')
	})

	it('names what to repair for each field', () => {
		expect(messages(signInSchema.safeParse({ email: '', password: '' }))).toEqual([
			'Enter your email address.',
			'Enter your password.',
		])
		expect(messages(signInSchema.safeParse({ email: 'not-an-email', password: 'x' }))).toEqual(['Enter a valid email address.'])
	})
})

describe('signUpSchema', () => {
	it('requires a password of at least 6 characters', () => {
		expect(messages(signUpSchema.safeParse({ email: 'maria@example.com', password: 'abcd' }))).toEqual([
			'Password must be at least 6 characters long.',
		])
		expect(signUpSchema.safeParse({ email: 'maria@example.com', password: 'abcdef' }).success).toBe(true)
	})

	it('rejects passwords longer than bcrypt reads (72)', () => {
		expect(signUpSchema.safeParse({ email: 'maria@example.com', password: 'a'.repeat(73) }).success).toBe(false)
	})
})
