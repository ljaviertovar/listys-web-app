import type { BaseListItemWithStoreSummary } from '@/types'

export function countItemsForStore(items: BaseListItemWithStoreSummary[], storeId: string): number {
  return items.filter(item =>
    item.usual_store?.id === storeId
    || item.other_stores?.some(store => store.id === storeId),
  ).length
}

export function shoppingActionMode(sessionActive: boolean): 'start' | 'resume' {
  return sessionActive ? 'resume' : 'start'
}
