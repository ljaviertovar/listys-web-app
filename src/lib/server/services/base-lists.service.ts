import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import {
  createBaseListSchema,
  updateBaseListSchema,
  createBaseListItemSchema,
  updateBaseListItemSchema,
} from '@/lib/validations/base-list'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { resolveListGroupId } from '@/lib/server/services/default-group.service'
import { DUPLICATE_LIST_NAME_MESSAGE, findListByName, isSameListName } from '@/lib/server/services/find-list-by-name'
import { buildItemStoreSummary, type ItemStoreStatsRow } from '@/components/features/base-lists/items/helpers/item-store-summary'

export async function createBaseList(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createBaseListSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  if (await findListByName(supabase, user.id, validation.data.name)) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, DUPLICATE_LIST_NAME_MESSAGE)
  }

  // After the name check, so a rejected name never creates the default group.
  const { group_id: requestedGroupId, ...listFields } = validation.data
  const groupId = await resolveListGroupId(supabase, user.id, requestedGroupId)

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .insert({ user_id: user.id, ...listFields, group_id: groupId })
    .select()
    .single()

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseList
}

export async function updateBaseList(id: string, data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = updateBaseListSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  if (validation.data.name) {
    const { data: currentList } = await supabase
      .from('base_lists')
      .select('name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // A missing list is answered with 404 by the update below.
    if (currentList && !isSameListName(currentList.name, validation.data.name)) {
      if (await findListByName(supabase, user.id, validation.data.name, id)) {
        throw new ApiServiceError(409, ErrorCode.CONFLICT, DUPLICATE_LIST_NAME_MESSAGE)
      }
    }
  }

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseList
}

export async function deleteBaseList(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { error } = await supabase.from('base_lists').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}

export async function getBaseList(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  // RLS handles access: owners and collaborators can both read
  const { data: baseList, error } = await supabase
    .from('base_lists')
    .select(`
      *,
      items:base_list_items(
        *,
        usual_store:stores!base_list_items_usual_store_id_fkey(id, name),
        store_stats:base_list_item_store_stats(
          store_id, purchase_count, last_purchased_at, last_price, last_quantity, last_unit, last_price_at, store:stores(id, name)
        )
      ),
      collaborators:list_collaborators(id, user_id, role, joined_at)
    `)
    .eq('id', id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  const items = (baseList.items ?? []).map(item => {
    const { usual_store, store_stats, ...itemFields } = item
    return {
      ...itemFields,
      ...buildItemStoreSummary(
        store_stats as ItemStoreStatsRow[] | null,
        usual_store,
        item.usual_store_source,
      ),
    }
  })

  return { ...baseList, items, is_owner: baseList.user_id === user.id }
}

export async function getBaseLists() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: baseLists, error } = await supabase
    .from('base_lists')
    .select('id, name, notes, group_id, created_at, items:base_list_items(count)')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseLists
}

export async function getLikelyNeededItems(limit: number) {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('likely_needed_items', { p_limit: limit })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Could not load likely-needed items')
  }

  const rows = data ?? []
  const hasHistory = rows[0]?.has_history ?? false
  const items = rows.flatMap(row => {
    if (
      row.id === null || row.name === null || row.base_list_id === null || row.base_list_name === null ||
      row.interval_days === null || row.days_since === null
    ) return []

    return [{
      id: row.id,
      name: row.name,
      base_list: { id: row.base_list_id, name: row.base_list_name },
      usual_store: row.usual_store_id && row.usual_store_name
        ? { id: row.usual_store_id, name: row.usual_store_name }
        : null,
      interval_days: Number(row.interval_days),
      days_since: Number(row.days_since),
    }]
  })

  return { data: items, meta: { limit, has_history: hasHistory } }
}

export async function getBaseListsByGroup(groupId: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: baseLists, error } = await supabase
    .from('base_lists')
    .select('*, items:base_list_items(count)')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseLists
}

export async function createBaseListItem(data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = createBaseListItemSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { count, error: countError } = await supabase
    .from('base_list_items')
    .select('*', { count: 'exact', head: true })
    .eq('base_list_id', validation.data.base_list_id)

  if (countError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, countError.message)
  }

  if (count !== null && count >= MAX_ITEMS_PER_BASE_LIST) {
    throw new ApiServiceError(
      409,
      ErrorCode.LIMIT_EXCEEDED,
      `This list has reached the maximum limit of ${MAX_ITEMS_PER_BASE_LIST} items. Please remove some items before adding more.`
    )
  }

  const { data: item, error } = await supabase
    .from('base_list_items')
    .insert(validation.data)
    .select()
    .single()

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return item
}

export async function updateBaseListItem(id: string, data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = updateBaseListItemSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  if (Object.hasOwn(validation.data, 'usual_store_id')) {
    const { error: rpcError } = await supabase.rpc('set_item_usual_store', {
      p_item_id: id,
      p_store_id: validation.data.usual_store_id ?? null,
    })

    if (rpcError) {
      if (rpcError.code === 'P0002') {
        throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Not found')
      }
      if (rpcError.code === '22023' || rpcError.code === '22P02') {
        throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'Invalid request')
      }
      console.error('[updateBaseListItem] usual store update failed', { code: rpcError.code ?? 'unknown' })
      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')
    }

    const { data: item, error } = await supabase
      .from('base_list_items')
      .select(`
        *,
        usual_store:stores!base_list_items_usual_store_id_fkey(id, name),
        store_stats:base_list_item_store_stats(
          store_id, purchase_count, last_purchased_at, store:stores(id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !item) {
      const status = error?.code === 'PGRST116' ? 404 : 500
      throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, status === 404 ? 'Not found' : 'Something went wrong. Please try again.')
    }

    const { usual_store, store_stats, ...itemFields } = item
    return {
      ...itemFields,
      ...buildItemStoreSummary(store_stats as ItemStoreStatsRow[] | null, usual_store, item.usual_store_source),
    }
  }

  const { data: item, error } = await supabase
    .from('base_list_items')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return item
}

export async function deleteBaseListItem(id: string) {
  const { supabase } = await createAuthenticatedClient()

  const { error } = await supabase.from('base_list_items').delete().eq('id', id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}
