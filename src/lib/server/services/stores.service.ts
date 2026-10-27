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
}

type StoreRow = { id: string; name: string; created_at: string; updated_at: string }

function toStoreDto(row: StoreRow, receiptCount: number): StoreDto {
  return {
    id: row.id,
    name: row.name,
    receipt_count: receiptCount,
    created_at: row.created_at,
    updated_at: row.updated_at,
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

  const { data, error } = await supabase
    .from('stores')
    .select('id, name, created_at, updated_at, receipts:tickets(count)')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(MAX_STORES_PER_USER)

  if (error) {
    console.error('[stores] could not list stores', { code: error.code })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your stores. Please try again.')
  }

  const rows = (data ?? []) as Array<StoreRow & { receipts?: Array<{ count: number }> | null }>
  const stores = rows.map(row => toStoreDto(row, row.receipts?.[0]?.count ?? 0))

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
