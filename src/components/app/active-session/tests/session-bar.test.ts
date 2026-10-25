import { describe, expect, it } from 'vitest'

import { isSessionScreen } from '@/components/app/active-session/active-session-bar'

describe('isSessionScreen', () => {
	it('is true only on the screen of that session', () => {
		expect(isSessionScreen('/shopping/s1', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s1/anything', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s2', 's1')).toBe(false)
		expect(isSessionScreen('/shopping-lists', 's1')).toBe(false)
		expect(isSessionScreen('/shopping/s10', 's1')).toBe(false)
	})
})
