import { describe, expect, it } from 'vitest'

import type { ShoppingSessionItem } from '@/types'
import { itemsForSessionProgress, splitSessionSections } from '../helpers/split-session-sections'

const item = (id: string, is_other_store: boolean) => ({ id, is_other_store }) as ShoppingSessionItem

describe('splitSessionSections', () => {
	it('keeps the existing item order within the selected-store and other-store sections', () => {
		const items = [item('first', false), item('second', true), item('third', false), item('fourth', true)]

		expect(splitSessionSections(items)).toEqual({
			storeItems: [items[0], items[2]],
			otherItems: [items[1], items[3]],
		})
	})

	it('returns empty sections for an empty session', () => {
		expect(splitSessionSections([])).toEqual({ storeItems: [], otherItems: [] })
	})
})

describe('itemsForSessionProgress', () => {
	it('counts only current-store items on a store-scoped trip', () => {
		const items = [
			{ id: 'milk', is_other_store: false },
			{ id: 'bread', is_other_store: true },
			{ id: 'eggs', is_other_store: false },
		]

		expect(itemsForSessionProgress(items, true).map(item => item.id)).toEqual(['milk', 'eggs'])
		expect(itemsForSessionProgress(items, false)).toEqual(items)
	})
})
