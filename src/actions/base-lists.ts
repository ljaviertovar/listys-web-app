'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createBaseListSchema,
  updateBaseListSchema,
  createBaseListItemSchema,
  updateBaseListItemSchema,
} from '@/lib/validations/base-list'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { buildItemStoreSummary, type ItemStoreStatsRow } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { resolveListGroupId } from '@/lib/server/services/default-group.service'
import { DUPLICATE_LIST_NAME_MESSAGE, findListByName, isSameListName } from '@/lib/server/services/find-list-by-name'
import { revalidatePath } from 'next/cache'

export async function createBaseList(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createBaseListSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  if (await findListByName(supabase, user.id, validation.data.name)) {
    return { error: DUPLICATE_LIST_NAME_MESSAGE }
  }

  // After the name check, so a rejected name never creates the default group.
  const { group_id: requestedGroupId, ...listFields } = validation.data
  let groupId: string
  try {
    groupId = await resolveListGroupId(supabase, user.id, requestedGroupId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'We couldn’t create your list. Try again.' }
  }

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .insert({
      user_id: user.id,
      ...listFields,
      group_id: groupId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shopping-lists')
  return { data: baseList }
}

export async function updateBaseList(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateBaseListSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Names are unique across the account, not per group.
  if (validation.data.name) {
    const { data: currentList } = await supabase
      .from('base_lists')
      .select('name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // A missing list is answered by the update below.
    if (currentList && !isSameListName(currentList.name, validation.data.name)) {
      if (await findListByName(supabase, user.id, validation.data.name, id)) {
        return { error: DUPLICATE_LIST_NAME_MESSAGE }
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
    return { error: error.message }
  }

  revalidatePath(`/base-lists/${id}`)
  return { data: baseList }
}

export async function deleteBaseList(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('base_lists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shopping-lists')
  return { success: true }
}

export async function getBaseList(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // RLS handles access for both owners and collaborators; no user_id filter needed
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
    return { error: error.message }
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

  return { data: { ...baseList, items, is_owner: baseList.user_id === user.id } }
}

export async function getBaseLists() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: baseLists, error } = await supabase
    .from('base_lists')
    .select('id, name, group_id')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data: baseLists }
}

// Base List Items
export async function createBaseListItem(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createBaseListItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if base list has reached the maximum number of items
  const { count, error: countError } = await supabase
    .from('base_list_items')
    .select('*', { count: 'exact', head: true })
    .eq('base_list_id', validation.data.base_list_id)

  if (countError) {
    return { error: countError.message }
  }

  if (count !== null && count >= MAX_ITEMS_PER_BASE_LIST) {
    return {
      error: `This list has reached the maximum limit of ${MAX_ITEMS_PER_BASE_LIST} items. Please remove some items before adding more.`
    }
  }

  const { data: item, error } = await supabase
    .from('base_list_items')
    .insert(validation.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/base-lists/${validation.data.base_list_id}`)
  return { data: item }
}

export async function updateBaseListItem(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateBaseListItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // First get the item to find the base_list_id for revalidation
  const { data: existingItem } = await supabase
    .from('base_list_items')
    .select('base_list_id')
    .eq('id', id)
    .single()

  const { data: item, error } = await supabase
    .from('base_list_items')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  if (existingItem) {
    revalidatePath(`/base-lists/${existingItem.base_list_id}`)
  }

  return { data: item }
}

export async function deleteBaseListItem(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // First get the item to find the base_list_id for revalidation
  const { data: existingItem } = await supabase
    .from('base_list_items')
    .select('base_list_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('base_list_items')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (existingItem) {
    revalidatePath(`/base-lists/${existingItem.base_list_id}`)
  }

  return { success: true }
}
