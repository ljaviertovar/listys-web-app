import { normalizeCategory } from '@/data/constants'
import type { TicketItem } from '@/types'

export interface TicketItemGroup {
	key: string
	title: string
	items: TicketItem[]
}

/** Groups items by normalised category, sorted by name, with the uncategorised ones under "Other". */
export function groupTicketItems(items: TicketItem[]): TicketItemGroup[] {
	const groups = new Map<string, TicketItem[]>()
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

/** Unit price times quantity; a missing quantity counts as one and a missing price as nothing. */
export function lineTotal(item: Pick<TicketItem, 'price' | 'quantity'>): number {
	return (item.price ?? 0) * (item.quantity ?? 1)
}

export function sumLineTotals(items: Pick<TicketItem, 'price' | 'quantity'>[]): number {
	return items.reduce((sum, item) => sum + lineTotal(item), 0)
}
