import { BaseListItem } from '@/features/base-lists/types'
import { TicketItem } from '@/features/tickets/types'

export type MergeableItem = Pick<BaseListItem | TicketItem, 'name' | 'quantity' | 'unit'>

/**
 * Merges ticket items into base list items
 * - If item exists (by name), updates quantity
 * - If item doesn't exist, adds it as new
 */
export function mergeItems(
  baseItems: MergeableItem[],
  ticketItems: MergeableItem[]
): MergeableItem[] {
  const itemMap = new Map<string, MergeableItem>()

  // Add all base items to map
  baseItems.forEach((item) => {
    const key = item.name.toLowerCase().trim()
    itemMap.set(key, { ...item })
  })

  // Merge ticket items
  ticketItems.forEach((ticketItem) => {
    const key = ticketItem.name.toLowerCase().trim()
    const existing = itemMap.get(key)

    if (existing) {
      // Update quantity if item exists
      itemMap.set(key, {
        ...existing,
        quantity: existing.quantity + ticketItem.quantity,
      })
    } else {
      // Add new item
      itemMap.set(key, { ...ticketItem })
    }
  })

  return Array.from(itemMap.values())
}
