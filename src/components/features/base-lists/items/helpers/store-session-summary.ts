import type { BaseListItemWithStoreSummary } from '@/types'

export interface UsualStoreItemSummary {
	counts: Record<string, number>
	unassignedCount: number
}

/** Counts only a list item's chosen usual store; receipt history at another store does not put it into that trip. */
export function summarizeItemsByStore(items: BaseListItemWithStoreSummary[]): UsualStoreItemSummary {
	const counts: Record<string, number> = {}
	let unassignedCount = 0
	for (const item of items) {
		const storeIds = new Set([
			...(item.usual_store?.id ? [item.usual_store.id] : []),
			...(item.other_stores ?? []).map(store => store.id),
		])
		if (!storeIds.size) {
			unassignedCount += 1
			continue
		}
		for (const id of storeIds) counts[id] = (counts[id] ?? 0) + 1
	}
	return { counts, unassignedCount }
}

export function itemsForStore(items: BaseListItemWithStoreSummary[], storeId: string): BaseListItemWithStoreSummary[] {
	return items.filter(item => item.usual_store?.id === storeId || item.other_stores?.some(store => store.id === storeId))
}

export function countItemsForStore(items: BaseListItemWithStoreSummary[], storeId: string): number {
  return items.filter(item =>
    item.usual_store?.id === storeId
    || item.other_stores?.some(store => store.id === storeId),
  ).length
}

export function shoppingActionMode(sessionActive: boolean): 'start' | 'resume' {
  return sessionActive ? 'resume' : 'start'
}
