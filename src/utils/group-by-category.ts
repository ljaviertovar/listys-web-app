import { normalizeCategory } from '@/data/constants'

export interface CategoryGroup<T> {
	/** Normalised category name; an item without one goes under "Other". */
	key: string
	title: string
	items: T[]
}

/** Groups items by normalised category, sorted by name, with the uncategorised ones under "Other". */
export function groupByCategory<T extends { category?: string | null }>(items: T[]): CategoryGroup<T>[] {
	const groups = new Map<string, T[]>()
	for (const item of items) {
		const key = normalizeCategory(item.category || '') || 'Other'
		const bucket = groups.get(key)
		if (bucket) bucket.push(item)
		else groups.set(key, [item])
	}

	return [...groups.entries()]
		.sort(([a], [b]) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
		.map(([key, groupItems]) => ({ key, title: key, items: groupItems }))
}
