import { groupByCategory, type CategoryGroup } from '@/utils'
import type { TicketItem } from '@/types'

export type TicketItemGroup = CategoryGroup<TicketItem>

/** Groups a receipt's items by category; the same grouping every list uses. */
export function groupTicketItems(items: TicketItem[]): TicketItemGroup[] {
	return groupByCategory(items)
}

/** Unit price times quantity; a missing quantity counts as one and a missing price as nothing. */
export function lineTotal(item: Pick<TicketItem, 'price' | 'quantity'>): number {
	return (item.price ?? 0) * (item.quantity ?? 1)
}

export function sumLineTotals(items: Pick<TicketItem, 'price' | 'quantity'>[]): number {
	return items.reduce((sum, item) => sum + lineTotal(item), 0)
}
