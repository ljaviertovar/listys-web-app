import { describe, expect, it } from 'vitest'

import { buildListCardMeta } from '../helpers/list-card-meta'

describe('buildListCardMeta', () => {
	it('says a list was never shopped when it has no completed trip', () => {
		expect(buildListCardMeta(null, 0)).toBe('No trips yet')
		expect(buildListCardMeta(undefined, undefined)).toBe('No trips yet')
	})

	it('names the last trip and how many people the list is shared with', () => {
		const text = buildListCardMeta('2026-10-28T22:07:00.000Z', 2)

		expect(text.startsWith('Last trip ')).toBe(true)
		expect(text.endsWith(' · Shared with 2 people')).toBe(true)
		expect(buildListCardMeta('2026-10-28T22:07:00.000Z', 1).endsWith('Shared with 1 person')).toBe(true)
	})
})
