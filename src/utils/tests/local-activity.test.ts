import { describe, expect, it } from 'vitest'

import { isOwnRecentActivity, markLocalMutation } from '../local-activity'

describe('own activity window', () => {
	it('treats a realtime event right after this tab sent a change as the echo of that change', () => {
		markLocalMutation(10_000)

		expect(isOwnRecentActivity(10_500)).toBe(true)
	})

	it('announces an event that arrives long after the last local change', () => {
		markLocalMutation(10_000)

		expect(isOwnRecentActivity(20_000)).toBe(false)
	})
})
