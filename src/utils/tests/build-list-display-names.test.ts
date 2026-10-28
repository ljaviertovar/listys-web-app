import { describe, expect, it } from 'vitest'

import { buildListDisplayNames } from '@/utils/build-list-display-names'

const list = (id: string, name: string, created_at: string | null = '2026-01-01T00:00:00Z') => ({ id, name, created_at })

describe('buildListDisplayNames', () => {
	it('leaves distinct names alone', () => {
		const names = buildListDisplayNames([list('a', 'Pantry'), list('b', 'Costco')])
		expect([...names]).toEqual([
			['a', 'Pantry'],
			['b', 'Costco'],
		])
	})

	it('numbers duplicates from the oldest, which keeps the plain name', () => {
		const names = buildListDisplayNames([
			list('new', 'Weekly', '2026-03-01T00:00:00Z'),
			list('old', 'Weekly', '2026-01-01T00:00:00Z'),
		])
		expect(names.get('old')).toBe('Weekly')
		expect(names.get('new')).toBe('Weekly (2)')
	})

	it('handles three lists with the same name', () => {
		const names = buildListDisplayNames([
			list('c', 'Weekly', '2026-03-01T00:00:00Z'),
			list('a', 'Weekly', '2026-01-01T00:00:00Z'),
			list('b', 'Weekly', '2026-02-01T00:00:00Z'),
		])
		expect([names.get('a'), names.get('b'), names.get('c')]).toEqual(['Weekly', 'Weekly (2)', 'Weekly (3)'])
	})

	it('treats case and surrounding spaces as the same name and keeps each stored spelling', () => {
		const names = buildListDisplayNames([
			list('a', 'Weekly', '2026-01-01T00:00:00Z'),
			list('b', ' weekly ', '2026-02-01T00:00:00Z'),
		])
		expect(names.get('a')).toBe('Weekly')
		expect(names.get('b')).toBe(' weekly  (2)')
	})

	it('breaks a tie on created_at with the id, and puts a missing date first', () => {
		const tie = buildListDisplayNames([list('b', 'Weekly'), list('a', 'Weekly')])
		expect(tie.get('a')).toBe('Weekly')
		expect(tie.get('b')).toBe('Weekly (2)')

		const missing = buildListDisplayNames([list('a', 'Weekly'), list('z', 'Weekly', null)])
		expect(missing.get('z')).toBe('Weekly')
	})

	it('keeps a suffix when an unrelated list is added', () => {
		const base = [list('a', 'Weekly', '2026-01-01T00:00:00Z'), list('b', 'Weekly', '2026-02-01T00:00:00Z')]
		const before = buildListDisplayNames(base)
		const after = buildListDisplayNames([...base, list('c', 'Costco', '2026-03-01T00:00:00Z')])
		expect(after.get('b')).toBe(before.get('b'))
	})

	it('returns an empty map for no lists', () => {
		expect(buildListDisplayNames([]).size).toBe(0)
	})
})
