import type { ShoppingSessionItem } from '@/types'

export function splitSessionSections(items: ShoppingSessionItem[]) {
  return {
    storeItems: items.filter(item => !item.is_other_store),
    otherItems: items.filter(item => item.is_other_store),
  }
}
