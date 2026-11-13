import type { ShoppingSessionItem } from '@/types'

export function splitSessionSections(items: ShoppingSessionItem[]) {
  return {
    storeItems: items.filter(item => !item.is_other_store),
    otherItems: items.filter(item => item.is_other_store),
  }
}

export function itemsForSessionProgress<T extends { is_other_store: boolean }>(items: T[], storeScoped: boolean): T[] {
	return storeScoped ? items.filter(item => !item.is_other_store) : items
}
