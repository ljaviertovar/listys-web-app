'use server'

import { createClient } from '@/lib/supabase/server'
import { createGroupSchema, updateGroupSchema } from '@/lib/validations/group'
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
    return { error: validation.error.errors[0].message }
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

  revalidatePath('/groups')
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
    return { error: validation.error.errors[0].message }
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

  revalidatePath('/groups')
  revalidatePath(`/groups/${id}`)
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

  revalidatePath('/groups')
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
