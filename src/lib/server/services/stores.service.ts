import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseWithSchema } from '@/lib/api/zod'
import { MAX_STORES_PER_USER } from '@/lib/config/limits'
import { mapRpcError } from '@/lib/server/services/rpc-errors'
import { createStoreSchema, mergeStoresSchema, updateStoreSchema } from '@/lib/validations/store'

/** What the API returns for a store: never the user id or the normalized key, which are internal. */
export type StoreDto = {
  id: string
  name: string
  receipt_count: number
  created_at: string
  updated_at: string
	last_visit: { kind: 'trip' | 'receipt'; id: string; at: string; total_amount: number | null; items_count?: number | null } | null
	/** Base-list items whose usual store this is. */
	usual_items_count?: number
}

type StoreRow = { id: string; name: string; created_at: string; updated_at: string }

function toStoreDto(
	row: StoreRow,
	receiptCount: number,
	lastVisit: StoreDto['last_visit'] = null,
): StoreDto {
  return {
    id: row.id,
    name: row.name,
    receipt_count: receiptCount,
    created_at: row.created_at,
    updated_at: row.updated_at,
		last_visit: lastVisit,
  }
}

type Client = Awaited<ReturnType<typeof createAuthenticatedClient>>['supabase']

async function countReceipts(supabase: Client, storeId: string) {
  const { count, error } = await supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('store_id', storeId)
  if (error) {
    console.error('[stores] could not count receipts', { code: error.code })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')
  }
  return count ?? 0
}

/** The user's stores by name, with how many receipts each has. Bounded by the store limit, so it needs no paging. */
export async function listStores() {
  const { supabase, user } = await createAuthenticatedClient()

	const [{ data, error }, { data: visits, error: visitsError }, { data: usualRows }] = await Promise.all([
	supabase
		.from('stores')
		.select('id, name, created_at, updated_at, receipts:tickets(count)')
		.eq('user_id', user.id)
		.order('name', { ascending: true })
		.order('created_at', { ascending: true })
		.limit(MAX_STORES_PER_USER),
	supabase.rpc('store_last_visits'),
	// How many items each store is the usual store of; a failure only leaves the count out of the cards.
	supabase.from('base_list_items').select('usual_store_id').not('usual_store_id', 'is', null).limit(5000),
  ])

  if (error) {
    console.error('[stores] could not list stores', { code: error.code })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your stores. Please try again.')
  }
	if (visitsError) {
		console.error('[stores] could not load last visits', { code: visitsError.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your stores. Please try again.')
	}
	const visitRows = visits ?? []
	const receiptVisitIds = visitRows.filter(visit => visit.kind === 'receipt').map(visit => visit.id)
	const tripVisitIds = visitRows.filter(visit => visit.kind === 'trip').map(visit => visit.id)
	const [receiptItems, tripItems] = await Promise.all([
		receiptVisitIds.length ? supabase.from('tickets').select('id, total_items').eq('user_id', user.id).in('id', receiptVisitIds) : Promise.resolve({ data: [], error: null }),
		tripVisitIds.length ? supabase.from('shopping_sessions').select('id, items:shopping_session_items(count)').eq('user_id', user.id).in('id', tripVisitIds) : Promise.resolve({ data: [], error: null }),
	])
	if (receiptItems.error || tripItems.error) {
		console.error('[stores] could not load last-visit item counts', { code: receiptItems.error?.code ?? tripItems.error?.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your stores. Please try again.')
	}
	const itemCountByVisit = new Map<string, number | null>()
	for (const receipt of receiptItems.data ?? []) itemCountByVisit.set(receipt.id, receipt.total_items)
	for (const trip of tripItems.data ?? []) itemCountByVisit.set(trip.id, trip.items?.[0]?.count ?? null)

  const rows = (data ?? []) as Array<StoreRow & { receipts?: Array<{ count: number }> | null }>
	const lastVisitByStore = new Map(visitRows.map(visit => [visit.store_id, {
		kind: visit.kind as 'trip' | 'receipt',
		id: visit.id,
		at: visit.at,
		total_amount: visit.total_amount,
		items_count: itemCountByVisit.get(visit.id) ?? null,
	} satisfies NonNullable<StoreDto['last_visit']>]))
	const usualItemsByStore = new Map<string, number>()
	for (const row of usualRows ?? []) {
		if (row.usual_store_id) usualItemsByStore.set(row.usual_store_id, (usualItemsByStore.get(row.usual_store_id) ?? 0) + 1)
	}
	const stores = rows.map(row => ({
		...toStoreDto(row, row.receipts?.[0]?.count ?? 0, lastVisitByStore.get(row.id) ?? null),
		usual_items_count: usualItemsByStore.get(row.id) ?? 0,
	}))

  return { stores, meta: { count: stores.length, limit: MAX_STORES_PER_USER } }
}

export async function createStore(data: unknown) {
  const { supabase } = await createAuthenticatedClient()
  const { name } = parseWithSchema(createStoreSchema, data)

  const { data: store, error } = await supabase.rpc('create_store', { p_name: name, p_max_stores: MAX_STORES_PER_USER })
  if (error || !store) throw mapRpcError(error ?? {}, 'stores')

  return toStoreDto(store, 0)
}

/** Renames a store; its previous name keeps resolving to it (the database keeps it as an alias). */
export async function renameStore(storeId: string, data: unknown) {
  const { supabase } = await createAuthenticatedClient()
  const { name } = parseWithSchema(updateStoreSchema, data)

  const { data: store, error } = await supabase.rpc('rename_store', { p_store_id: storeId, p_name: name })
  if (error || !store) throw mapRpcError(error ?? {}, 'stores')

  return toStoreDto(store, await countReceipts(supabase, storeId))
}

/** Moves the source store's receipts and names into the target, then removes the source, in one transaction. */
export async function mergeStores(targetStoreId: string, data: unknown) {
  const { supabase } = await createAuthenticatedClient()
  const { source_store_id } = parseWithSchema(mergeStoresSchema, data)

  if (source_store_id === targetStoreId) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'Cannot merge a store into itself')
  }

  const { data: store, error } = await supabase.rpc('merge_stores', { p_target_id: targetStoreId, p_source_id: source_store_id })
  if (error || !store) throw mapRpcError(error ?? {}, 'stores')

  return toStoreDto(store, await countReceipts(supabase, targetStoreId))
}

/** Failures that carry nothing a person can act on: logged with the code only, answered with a safe message. */
function failRead(what: string, error: { code?: string } | null): never {
  console.error(`[stores] could not read ${what}`, { code: error?.code })
  throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load this store. Please try again.')
}

const sumAmounts = (rows: Array<{ total_amount: number | null }> | null) =>
  (rows ?? []).reduce((sum, row) => sum + (typeof row.total_amount === 'number' ? row.total_amount : 0), 0)

/**
 * What a store's own screen shows: its counts, what was spent there since the start of the year (completed trips plus
 * receipts that are not attached to a trip, the same rule as the month summary) and the names printed on its receipts.
 * Each name is one alias of the store; the store's own name is the one that cannot be removed.
 */
export async function getStoreDetail(storeId: string, now: Date = new Date()) {
  const { supabase, user } = await createAuthenticatedClient()
  const since = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, normalized_name, created_at, updated_at')
    .eq('id', storeId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (storeError) failRead('the store', storeError)
  if (!store) throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Store not found')

  const [receiptCount, usual, trips, looseReceipts, aliases, rawNames, visits] = await Promise.all([
    countReceipts(supabase, storeId),
    supabase.from('base_list_items').select('id', { count: 'exact', head: true }).eq('usual_store_id', storeId),
    supabase.from('shopping_sessions').select('total_amount').eq('store_id', storeId).eq('status', 'completed').gte('completed_at', since),
    supabase.from('tickets').select('total_amount').eq('store_id', storeId).is('shopping_session_id', null).gte('created_at', since),
    supabase.from('store_aliases').select('id, alias_key').eq('store_id', storeId).eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('tickets').select('store_name').eq('store_id', storeId).not('store_name', 'is', null).order('created_at', { ascending: false }).limit(200),
    supabase.rpc('store_last_visits'),
  ])
  for (const result of [usual, trips, looseReceipts, aliases, rawNames, visits]) {
    if (result.error) failRead('the store', result.error)
  }

  // A receipt name resolves through the same normalization the database uses, so it is matched to its alias by key.
  const distinctRaw = [...new Set((rawNames.data ?? []).map(row => row.store_name).filter((name): name is string => !!name))].slice(0, 20)
  const keys = await Promise.all(distinctRaw.map(async name => {
    const { data } = await supabase.rpc('normalize_store_name', { input_text: name })
    return [name, data] as const
  }))
  const rawByKey = new Map<string, string>()
  for (const [name, key] of keys) if (key && !rawByKey.has(key)) rawByKey.set(key, name)

  const names = (aliases.data ?? []).map(alias => {
    const canonical = alias.alias_key === store.normalized_name
    return { id: alias.id, name: canonical ? store.name : rawByKey.get(alias.alias_key) ?? alias.alias_key, removable: !canonical }
  })

  const visit = (visits.data ?? []).find(row => row.store_id === storeId)
  return {
    ...toStoreDto(store, receiptCount, visit ? { kind: visit.kind as 'trip' | 'receipt', id: visit.id, at: visit.at, total_amount: visit.total_amount } : null),
    usual_items_count: usual.count ?? 0,
    spent_since: since,
    spent_total: Math.round((sumAmounts(trips.data) + sumAmounts(looseReceipts.data)) * 100) / 100,
    names,
  }
}

/**
 * Stops a printed name from resolving to this store: receipts that print it will ask which store they belong to. The
 * store's own name is refused, since the store would no longer recognise itself.
 */
export async function removeStoreAlias(storeId: string, aliasId: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const [{ data: store, error: storeError }, { data: alias, error: aliasError }] = await Promise.all([
    supabase.from('stores').select('normalized_name').eq('id', storeId).eq('user_id', user.id).maybeSingle(),
    supabase.from('store_aliases').select('id, alias_key').eq('id', aliasId).eq('store_id', storeId).eq('user_id', user.id).maybeSingle(),
  ])
  if (storeError || aliasError) failRead('the name', storeError ?? aliasError)
  if (!store || !alias) throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Name not found')
  if (alias.alias_key === store.normalized_name) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'The store’s own name cannot be removed')
  }

  const { error } = await supabase.from('store_aliases').delete().eq('id', aliasId).eq('store_id', storeId).eq('user_id', user.id)
  if (error) failRead('the name', error)
  return { success: true }
}
