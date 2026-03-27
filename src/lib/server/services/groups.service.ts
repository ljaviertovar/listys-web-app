import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { createGroupSchema, updateGroupSchema } from '@/lib/validations/group'
import { MAX_GROUPS_PER_USER } from '@/lib/config/limits'
import { assertDemoActionAllowed } from '@/lib/demo/policy'

export async function createGroup(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createGroupSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  assertDemoActionAllowed(user, 'create-group')

  const { count, error: countError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, countError.message)
  }

  if (count !== null && count >= MAX_GROUPS_PER_USER) {
    throw new ApiServiceError(
      409,
      ErrorCode.LIMIT_EXCEEDED,
      `You have reached the maximum limit of ${MAX_GROUPS_PER_USER} groups. Please delete a group before creating a new one.`
    )
  }

  const { data: existingGroup } = await supabase
    .from('groups')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', validation.data.name)
    .maybeSingle()

  if (existingGroup) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, 'A group with this name already exists. Please choose a different name.')
  }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      user_id: user.id,
      ...validation.data,
    })
    .select()
    .single()

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return group
}

export async function updateGroup(id: string, data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = updateGroupSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  assertDemoActionAllowed(user, 'update-group')

  if (validation.data.name) {
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', validation.data.name)
      .neq('id', id)
      .maybeSingle()

    if (existingGroup) {
      throw new ApiServiceError(409, ErrorCode.CONFLICT, 'A group with this name already exists. Please choose a different name.')
    }
  }

  const { data: group, error } = await supabase
    .from('groups')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return group
}

export async function deleteGroup(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  assertDemoActionAllowed(user, 'delete-group')

  const { error } = await supabase.from('groups').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}

export async function getGroups() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: groups, error } = await supabase
    .from('groups')
    .select('*, base_lists(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return groups
}

export async function getGroupsWithHistory() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: groups, error } = await supabase
    .from('groups')
    .select('*, base_lists(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  if (!groups || groups.length === 0) {
    return []
  }

  const groupsWithHistory = await Promise.all(
    groups.map(async group => {
      const baseListIds = Array.isArray(group.base_lists)
        ? group.base_lists.map(bl => bl.id).filter(Boolean)
        : []

      let completedRunsCount = 0

      if (baseListIds.length > 0) {
        const { count } = await supabase
          .from('shopping_sessions')
          .select('*', { count: 'exact', head: true })
          .in('base_list_id', baseListIds)
          .eq('status', 'completed')
        completedRunsCount = count ?? 0
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        completed_runs_count: completedRunsCount,
      }
    })
  )

  return groupsWithHistory.filter(g => g.completed_runs_count > 0)
}

export async function getGroup(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return group
}
