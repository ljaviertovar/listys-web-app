'use server'

import { createClient } from '@/lib/supabase/server'
import { createGroupSchema, updateGroupSchema } from '@/lib/validations/group'
import { MAX_GROUPS_PER_USER } from '@/lib/config/limits'
import { revalidatePath } from 'next/cache'

export async function createGroup(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createGroupSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user has reached the maximum number of groups
  const { count, error: countError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) {
    return { error: countError.message }
  }

  if (count !== null && count >= MAX_GROUPS_PER_USER) {
    return {
      error: `You have reached the maximum limit of ${MAX_GROUPS_PER_USER} groups. Please delete a group before creating a new one.`
    }
  }

  // Check for duplicate group name
  const { data: existingGroup } = await supabase
    .from('groups')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', validation.data.name)
    .maybeSingle()

  if (existingGroup) {
    return { error: 'A group with this name already exists. Please choose a different name.' }
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
    return { error: error.message }
  }

  revalidatePath('/ticket-groups')
  return { data: group }
}

export async function updateGroup(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateGroupSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check for duplicate group name (excluding current group)
  if (validation.data.name) {
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', validation.data.name)
      .neq('id', id)
      .maybeSingle()

    if (existingGroup) {
      return { error: 'A group with this name already exists. Please choose a different name.' }
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
    return { error: error.message }
  }

  revalidatePath('/ticket-groups')
  revalidatePath(`/ticket-groups/${id}`)
  return { data: group }
}

export async function deleteGroup(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ticket-groups')
  return { success: true }
}

export async function getGroups() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: groups, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: groups }
}

export async function getGroup(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: group }
}
