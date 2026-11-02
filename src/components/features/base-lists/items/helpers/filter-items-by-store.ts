import type { BaseListItemWithStoreSummary } from '@/types'

/** The filter value for the items that have no usual store; any other value is a store id. */
export const NO_USUAL_STORE = 'none'

type FilterItem = Pick<BaseListItemWithStoreSummary, 'usual_store'>

export interface StoreFilterOption {
	/** `NO_USUAL_STORE` or a store id. */
	value: string
	label: string
	count: number
}

/**
 * The stores a list can be narrowed to: each usual store with its items, and the items with none. There is nothing to
 * narrow until at least one item has a usual store, so an empty list means "do not show the filter".
 */
export function buildStoreFilterOptions(items: FilterItem[]): StoreFilterOption[] {
	const byStore = new Map<string, StoreFilterOption>()
	let untagged = 0
	for (const item of items) {
		const store = item.usual_store
		if (!store) {
			untagged += 1
			continue
		}
		const entry = byStore.get(store.id)
		if (entry) entry.count += 1
		else byStore.set(store.id, { value: store.id, label: store.name, count: 1 })
	}
	if (byStore.size === 0) return []

	const stores = [...byStore.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
	return untagged > 0 ? [...stores, { value: NO_USUAL_STORE, label: 'No Usual Store', count: untagged }] : stores
}

/** The filter to apply: the requested one when this list has items for it, otherwise none (a stale link shows everything). */
export function resolveStoreFilter(items: FilterItem[], requested: string | null | undefined): string | null {
	if (!requested) return null
	return buildStoreFilterOptions(items).some(option => option.value === requested) ? requested : null
}

export function filterItemsByUsualStore<T extends FilterItem>(items: T[], filter: string | null): T[] {
	if (!filter) return items
	return items.filter(item => (filter === NO_USUAL_STORE ? !item.usual_store : item.usual_store?.id === filter))
}
