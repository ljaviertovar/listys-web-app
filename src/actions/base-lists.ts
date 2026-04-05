'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createBaseListSchema,
  updateBaseListSchema,
  createBaseListItemSchema,
  updateBaseListItemSchema,
} from '@/lib/validations/base-list'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
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

  // Check for duplicate base list name within the same group
  const { data: existingList } = await supabase
    .from('base_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('group_id', validation.data.group_id)
    .ilike('name', validation.data.name)
    .maybeSingle()

  if (existingList) {
    return { error: 'A list with this name already exists in this group. Please choose a different name.' }
  }

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .insert({
      user_id: user.id,
      ...validation.data,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shopping-lists')
  revalidatePath(`/shopping-lists/${validation.data.group_id}`)
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

  // Check for duplicate base list name within the same group (excluding current list)
  if (validation.data.name) {
    // First get the current list to know its group_id
    const { data: currentList } = await supabase
      .from('base_lists')
      .select('group_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (currentList) {
      const { data: existingList } = await supabase
        .from('base_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', currentList.group_id)
        .ilike('name', validation.data.name)
        .neq('id', id)
        .maybeSingle()

      if (existingList) {
        return { error: 'A list with this name already exists in this group. Please choose a different name.' }
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
      items:base_list_items(*),
      collaborators:list_collaborators(id, user_id, role, joined_at)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: { ...baseList, is_owner: baseList.user_id === user.id } }
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

export async function getBaseListsByGroup(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: baseLists, error } = await supabase
    .from('base_lists')
    .select('*, items:base_list_items(count)')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
