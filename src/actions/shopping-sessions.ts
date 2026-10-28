'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createShoppingSessionSchema,
  updateShoppingSessionSchema,
  completeShoppingSessionSchema,
  updateShoppingSessionItemSchema,
  createShoppingSessionItemSchema,
} from '@/lib/validations/shopping-session'
import { ApiServiceError } from '@/lib/api/http'
import { completeSessionViaRpc } from '@/lib/server/services/complete-session-rpc'
import { mapStartShoppingSessionRpcError } from '@/lib/server/services/rpc-errors'
import { revalidatePath } from 'next/cache'

export async function createShoppingSession(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { data: shoppingSession, error } = await supabase.rpc('start_shopping_session', {
    p_base_list_id: validation.data.base_list_id,
    p_name: validation.data.name,
    p_store_id: validation.data.store_id ?? null,
  })

  if (error) {
    const mapped = mapStartShoppingSessionRpcError(error)
    return { error: mapped.message, ...(mapped.details ?? {}) }
  }

  if (!shoppingSession) return { error: 'Something went wrong. Please try again.' }

  revalidatePath('/dashboard')
  revalidatePath('/shopping')
  return { data: shoppingSession }
}

export async function updateShoppingSession(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/shopping/${id}`)
  revalidatePath('/dashboard')
  return { data: shoppingSession }
}

export async function completeShoppingSession(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = completeShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  let sync
  try {
    sync = await completeSessionViaRpc(supabase, id, validation.data)
  } catch (error) {
    if (error instanceof ApiServiceError) return { error: error.message }
    throw error
  }

  revalidatePath('/dashboard')
  revalidatePath('/shopping-history')
  revalidatePath(`/shopping/${id}`)
  return { success: true, sync }
}

export async function getActiveShoppingSession() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*),
      base_list:base_lists(*),
      store:stores(id, name)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  return { data: shoppingSession }
}

export async function getShoppingSession(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*),
      base_list:base_lists(*),
      store:stores(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  const { data: receipt, error: receiptError } = await supabase
    .from('tickets')
    .select('id, total_amount')
    .eq('shopping_session_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (receiptError) {
    return { error: receiptError.message }
  }

  return { data: { ...shoppingSession, receipt } }
}

export async function getShoppingHistory() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: sessions, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      store:stores(id, name),
      base_list:base_lists(
        name,
        group:groups(
          id,
          name,
          description
        )
      ),
      shopping_session_items(
        checked
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Count checked items for each session
  const sessionsWithCount = sessions?.map(session => {
    const { shopping_session_items: sessionItems, ...sessionData } = session
    const checkedItems = Array.isArray(sessionItems)
      ? sessionItems.filter((item: { checked: boolean | null }) => item.checked === true)
      : []

    return {
      ...sessionData,
      total_items: checkedItems.length
    }
  })

  return { data: sessionsWithCount }
}

// Shopping Session Items
export async function updateShoppingSessionItem(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateShoppingSessionItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { data: item, error } = await supabase
    .from('shopping_session_items')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Note: We don't revalidate here to avoid UI flicker during optimistic updates
  return { data: item }
}

export async function toggleShoppingSessionItem(id: string, checked: boolean) {
  return updateShoppingSessionItem(id, { checked })
}

export async function createShoppingSessionItem(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createShoppingSessionItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Get the max sort_order for this shopping session
  const { data: existingItems } = await supabase
    .from('shopping_session_items')
    .select('sort_order')
    .eq('shopping_session_id', validation.data.shopping_session_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingItems?.[0]?.sort_order ? existingItems[0].sort_order + 1 : 0

  const { data: item, error } = await supabase
    .from('shopping_session_items')
    .insert({
      ...validation.data,
      sort_order: nextSortOrder,
      checked: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/shopping/${validation.data.shopping_session_id}`)
  return { data: item }
}

export async function deleteShoppingSessionItem(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('shopping_session_items')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function cancelShoppingSession(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Delete shopping session (items will be deleted via CASCADE)
  const { error } = await supabase
    .from('shopping_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/history')
  return { success: true }
}
