import { describe, expect, it } from 'vitest'

import { describeAuthError } from '../helpers/describe-auth-error'

describe('describeAuthError', () => {
	it('gives an actionable message for invalid credentials without revealing account state', () => {
		expect(describeAuthError('Invalid login credentials', 'fallback')).toBe('We couldn’t sign you in. Check your details and try again.')
	})

	it('uses a safe fallback for provider and unknown errors', () => {
		expect(describeAuthError('provider internal error with account@example.test', 'We couldn’t sign you in. Try again.')).toBe(
			'We couldn’t sign you in. Try again.',
		)
		expect(describeAuthError(undefined, 'We couldn’t create your account. Try again.')).toBe(
			'We couldn’t create your account. Try again.',
		)
	})
})
