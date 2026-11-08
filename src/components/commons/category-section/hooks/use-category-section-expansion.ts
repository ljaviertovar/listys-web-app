'use client'

import { useState } from 'react'

export interface CategorySectionDescriptor {
	id: string
	defaultOpen: boolean
}

export type CategorySectionOpenOverrides = Readonly<Record<string, boolean>>

export function areCategorySectionsCollapsed(
	sections: readonly CategorySectionDescriptor[],
	overrides: CategorySectionOpenOverrides,
) {
	return sections.length > 0 && sections.every(section => !(overrides[section.id] ?? section.defaultOpen))
}

export function setAllCategorySectionsOpen(
	sections: readonly CategorySectionDescriptor[],
	open: boolean,
): Record<string, boolean> {
	return Object.fromEntries(sections.map(section => [section.id, open]))
}

export function useCategorySectionExpansion(sections: readonly CategorySectionDescriptor[]) {
	const [overrides, setOverrides] = useState<CategorySectionOpenOverrides>({})
	const allCollapsed = areCategorySectionsCollapsed(sections, overrides)

	function isOpen(id: string, defaultOpen: boolean) {
		return overrides[id] ?? defaultOpen
	}

	function onOpenChange(id: string, open: boolean) {
		setOverrides(previous => ({ ...previous, [id]: open }))
	}

	function toggleAll() {
		setOverrides(setAllCategorySectionsOpen(sections, allCollapsed))
	}

	return { isOpen, onOpenChange, allCollapsed, toggleAll }
}
