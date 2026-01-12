'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createBaseListSchema,
  updateBaseListSchema,
  createBaseListItemSchema,
  updateBaseListItemSchema,
} from '@/lib/validations/base-list'
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
    return { error: validation.error.errors[0].message }
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

  revalidatePath('/groups')
  revalidatePath(`/groups/${validation.data.group_id}`)
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
    return { error: validation.error.errors[0].message }
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

  revalidatePath('/groups')
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

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .select(`
      *,
      items:base_list_items(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: baseList }
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
    .select('*')
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
    return { error: validation.error.errors[0].message }
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
    return { error: validation.error.errors[0].message }
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
