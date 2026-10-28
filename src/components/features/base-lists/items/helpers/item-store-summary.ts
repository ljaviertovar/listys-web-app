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
}

export interface ItemStoreSummary {
  usual_store: { id: string; name: string; source: 'auto' | 'manual' } | null
  other_stores: StoreSummaryEntry[]
	store_prices: StorePriceEntry[]
}

export function buildItemStoreSummary(
  stats: ItemStoreStatsRow[] | null | undefined,
  usualStore: { id: string; name: string } | null | undefined,
  usualStoreSource: string | null | undefined,
): ItemStoreSummary {
  const usual = usualStore
    ? { ...usualStore, source: usualStoreSource === 'manual' ? 'manual' as const : 'auto' as const }
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
		}))
		.sort((a, b) => a.store.name.localeCompare(b.store.name) || a.store.id.localeCompare(b.store.id))

	return { usual_store: usual, other_stores, store_prices }
}

export function formatAlsoAt(otherStores: StoreSummaryEntry[]): string | null {
  if (otherStores.length === 0) return null

  const names = otherStores.slice(0, 2).map(store => store.name).join(', ')
  const additionalCount = otherStores.length - 2
  return `Also at ${names}${additionalCount > 0 ? ` +${additionalCount}` : ''}`
}
