import { describe, expect, it } from 'vitest'

import {
	areCategorySectionsCollapsed,
	setAllCategorySectionsOpen,
	type CategorySectionDescriptor,
} from '../hooks/use-category-section-expansion'

const sections: CategorySectionDescriptor[] = [
	{ id: 'dairy', defaultOpen: true },
	{ id: 'produce', defaultOpen: true },
]

describe('category section expansion', () => {
	it('collapses all open or mixed sections, then expands all when every section is closed', () => {
		expect(setAllCategorySectionsOpen(sections, false)).toEqual({ dairy: false, produce: false })
		expect(setAllCategorySectionsOpen(sections, true)).toEqual({ dairy: true, produce: true })
	})

	it('derives the all-collapsed state from current and default section state', () => {
		expect(areCategorySectionsCollapsed(sections, {})).toBe(false)
		expect(areCategorySectionsCollapsed(sections, { dairy: false, produce: false })).toBe(true)
		expect(areCategorySectionsCollapsed(sections, { dairy: false })).toBe(false)
		expect(areCategorySectionsCollapsed([], {})).toBe(false)
	})
})
