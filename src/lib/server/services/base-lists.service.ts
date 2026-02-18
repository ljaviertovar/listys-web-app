import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import {
  createBaseListSchema,
  updateBaseListSchema,
  createBaseListItemSchema,
  updateBaseListItemSchema,
} from '@/lib/validations/base-list'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

export async function createBaseList(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createBaseListSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: existingList } = await supabase
    .from('base_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('group_id', validation.data.group_id)
    .ilike('name', validation.data.name)
    .maybeSingle()

  if (existingList) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, 'A list with this name already exists in this group. Please choose a different name.')
  }

  const { data: baseList, error } = await supabase
    .from('base_lists')
    .insert({ user_id: user.id, ...validation.data })
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
        throw new ApiServiceError(409, ErrorCode.CONFLICT, 'A list with this name already exists in this group. Please choose a different name.')
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
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseList
}

export async function getBaseLists() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: baseLists, error } = await supabase
    .from('base_lists')
    .select('id, name, group_id')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return baseLists
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
