/** The usual store of one item, as the lists screen reads it: the list it is in and the store it is tagged with. */
export interface ListItemStoreRow {
	base_list_id: string
	store: { id: string; name: string } | null
}

export interface ListCardStore {
	id: string
	name: string
}

/** How many store labels a list card draws before the rest collapse into "+N". */
export const LIST_CARD_STORE_LIMIT = 2

/**
 * The stores that the items of each list are usually bought at, by list id: one entry per store, the one with the most items first
 * and ties in alphabetical order, so the card shows the same stores every time it is drawn.
 */
export function groupStoresByList(rows: ListItemStoreRow[]): Record<string, ListCardStore[]> {
	const counts = new Map<string, Map<string, { store: ListCardStore; items: number }>>()

	for (const row of rows) {
		const name = row.store?.name.trim()
		if (!row.store || !name) continue
		const byStore = counts.get(row.base_list_id) ?? new Map()
		const entry = byStore.get(row.store.id) ?? { store: { id: row.store.id, name }, items: 0 }
		entry.items += 1
		byStore.set(row.store.id, entry)
		counts.set(row.base_list_id, byStore)
	}

	const byList: Record<string, ListCardStore[]> = {}
	for (const [listId, byStore] of counts) {
		byList[listId] = [...byStore.values()]
			.sort((a, b) => b.items - a.items || a.store.name.localeCompare(b.store.name))
			.map(entry => entry.store)
	}
	return byList
}

/** The labels a list card draws and how many more stores there are: the first `limit` stores, then a "+N" for the rest. */
export function splitCardStores(stores: ListCardStore[], limit = LIST_CARD_STORE_LIMIT): { shown: ListCardStore[]; hiddenCount: number } {
	return { shown: stores.slice(0, limit), hiddenCount: Math.max(stores.length - limit, 0) }
}
