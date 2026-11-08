import { describe, expect, it } from 'vitest'

import { buildListCardMeta, buildSharedWithLabel } from '../helpers/list-card-meta'

describe('buildListCardMeta', () => {
	it('says a list was never shopped when it has no completed trip', () => {
		expect(buildListCardMeta(null)).toBe('No trips yet')
		expect(buildListCardMeta(undefined)).toBe('No trips yet')
	})

	it('names the last trip without mixing in who the list is shared with', () => {
		const text = buildListCardMeta('2026-10-28T22:07:00.000Z')

		expect(text.startsWith('Last trip ')).toBe(true)
		expect(text).not.toContain('Shared')
	})
})

describe('buildSharedWithLabel', () => {
	it('has no label for a list that is not shared', () => {
		expect(buildSharedWithLabel(0)).toBeNull()
		expect(buildSharedWithLabel(undefined)).toBeNull()
	})

	it('counts the people the list is shared with', () => {
		expect(buildSharedWithLabel(2)).toBe('Shared with 2 people')
		expect(buildSharedWithLabel(1)).toBe('Shared with 1 person')
	})
})
