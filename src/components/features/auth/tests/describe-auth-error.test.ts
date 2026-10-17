import { describe, expect, it } from 'vitest'

import { describeAuthError } from '../helpers/describe-auth-error'

describe('describeAuthError', () => {
	it('turns the Supabase credentials error into a sentence that says what to repair', () => {
		expect(describeAuthError('Invalid login credentials', 'fallback')).toBe(
			'Invalid login credentials. Check your email and password, then try again.',
		)
	})

	it('passes other messages through and falls back when there is none', () => {
		expect(describeAuthError('User already registered', 'fallback')).toBe('User already registered')
		expect(describeAuthError(undefined, 'An error occurred during sign in')).toBe('An error occurred during sign in')
	})
})
