export interface StoreSummaryEntry {
  id: string
  name: string
  purchase_count: number
}

export interface ItemStoreStatsRow {
  store_id: string
  purchase_count: number
  last_purchased_at: string | null
  store: { id: string; name: string } | null
}

export interface ItemStoreSummary {
  usual_store: { id: string; name: string; source: 'auto' | 'manual' } | null
  other_stores: StoreSummaryEntry[]
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

  return { usual_store: usual, other_stores }
}

export function formatAlsoAt(otherStores: StoreSummaryEntry[]): string | null {
  if (otherStores.length === 0) return null

  const names = otherStores.slice(0, 2).map(store => store.name).join(', ')
  const additionalCount = otherStores.length - 2
  return `Also at ${names}${additionalCount > 0 ? ` +${additionalCount}` : ''}`
}
