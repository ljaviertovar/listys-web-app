export interface StoreSummaryEntry {
  id: string
  name: string
  purchase_count: number
}

export interface ItemStoreStatsRow {
  store_id: string
  purchase_count: number
  last_purchased_at: string | null
	last_price?: number | null
	last_quantity?: number | null
	last_unit?: string | null
	last_price_at?: string | null
  store: { id: string; name: string } | null
}

export interface StorePriceEntry {
	store: { id: string; name: string }
	last_price: number
	last_quantity: number | null
	last_unit: string | null
	last_price_at: string | null
	purchase_count?: number
	last_purchased_at?: string | null
}

export type StoreHistoryEntry = Omit<StorePriceEntry, 'last_price' | 'purchase_count'> & {
	last_price: number | null
	purchase_count: number
}

export interface ItemStoreSummary {
  /** The store the item usually comes from, with how many purchases are recorded there. */
  usual_store: { id: string; name: string; source: 'auto' | 'manual'; purchase_count: number } | null
  /** Purchases recorded across every store, so the usual store can say how many of them happened there. */
  purchase_total: number
  other_stores: StoreSummaryEntry[]
	store_prices: StorePriceEntry[]
	/** Additive history including stores without a price; store_prices keeps its established numeric-price contract. */
	store_history: StoreHistoryEntry[]
}

export function buildItemStoreSummary(
  stats: ItemStoreStatsRow[] | null | undefined,
  usualStore: { id: string; name: string } | null | undefined,
  usualStoreSource: string | null | undefined,
): ItemStoreSummary {
  const usual = usualStore
    ? {
        ...usualStore,
        source: usualStoreSource === 'manual' ? 'manual' as const : 'auto' as const,
        purchase_count: (stats ?? []).find(row => row.store_id === usualStore.id)?.purchase_count ?? 0,
      }
    : null

  const orderedStores = (stats ?? [])
    .filter((row): row is ItemStoreStatsRow & { store: { id: string; name: string } } => Boolean(row.store))
    .filter(row => row.store.id !== usual?.id)
    .map(row => ({
      id: row.store.id,
      name: row.store.name,
      purchase_count: row.purchase_count,
      last_purchased_at: row.last_purchased_at,
    }))
    .sort((a, b) =>
      b.purchase_count - a.purchase_count
      || (b.last_purchased_at ?? '').localeCompare(a.last_purchased_at ?? '')
      || a.id.localeCompare(b.id),
    )
  const other_stores = orderedStores.map(({ id, name, purchase_count }) => ({ id, name, purchase_count }))
	const store_prices = (stats ?? [])
		.filter((row): row is ItemStoreStatsRow & { store: { id: string; name: string }; last_price: number } =>
			Boolean(row.store) && typeof row.last_price === 'number' && Number.isFinite(row.last_price) && row.last_price >= 0,
		)
		.map(row => ({
			store: row.store,
			last_price: row.last_price,
			last_quantity: row.last_quantity ?? null,
			last_unit: row.last_unit ?? null,
			last_price_at: row.last_price_at ?? null,
			purchase_count: row.purchase_count,
		}))
		.sort((a, b) => a.store.name.localeCompare(b.store.name) || a.store.id.localeCompare(b.store.id))
	const store_history: StoreHistoryEntry[] = (stats ?? [])
		.filter((row): row is ItemStoreStatsRow & { store: { id: string; name: string } } => Boolean(row.store))
		.map(row => ({ store: { id: row.store.id, name: row.store.name }, purchase_count: row.purchase_count,
			last_price: typeof row.last_price === 'number' && Number.isFinite(row.last_price) && row.last_price >= 0 ? row.last_price : null,
			last_quantity: row.last_quantity ?? null, last_unit: row.last_unit ?? null,
			last_price_at: row.last_price_at ?? null, last_purchased_at: row.last_purchased_at }))
	if (usual && !store_history.some(entry => entry.store.id === usual.id)) {
		store_history.push({ store: { id: usual.id, name: usual.name }, purchase_count: 0, last_price: null, last_quantity: null, last_unit: null, last_price_at: null, last_purchased_at: null })
	}
	store_history.sort((a, b) => a.store.name.localeCompare(b.store.name) || a.store.id.localeCompare(b.store.id))

	// Only stores the reader can see count: a collaborator whose store embeds are hidden learns nothing from the total.
	const purchase_total = (stats ?? []).reduce((sum, row) => sum + (row.store ? row.purchase_count ?? 0 : 0), 0)

	return { usual_store: usual, purchase_total, other_stores, store_prices, store_history }
}

export function formatAlsoAt(otherStores: StoreSummaryEntry[]): string | null {
  if (otherStores.length === 0) return null

  const names = otherStores.slice(0, 2).map(store => store.name).join(', ')
  const additionalCount = otherStores.length - 2
  return `Also at ${names}${additionalCount > 0 ? ` +${additionalCount}` : ''}`
}
