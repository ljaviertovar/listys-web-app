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

  // Check if user already has an active shopping session
  const { data: existingSession } = await supabase
    .from('shopping_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingSession) {
    return {
      error: 'You already have an active shopping run. Please complete or cancel it before starting a new one.',
      activeSessionId: existingSession.id
    }
  }

  // Get base list items to copy
  const { data: baseList, error: baseListError } = await supabase
    .from('base_lists')
    .select(`
      *,
      items:base_list_items(*)
    `)
    .eq('id', validation.data.base_list_id)
    .eq('user_id', user.id)
    .single()

  if (baseListError || !baseList) {
    return { error: 'Base list not found' }
  }

  // Validate base list has items
  if (!baseList.items || baseList.items.length === 0) {
    return { error: 'Cannot create shopping run from an empty base list. Please add items to your base list first.' }
  }

  // Create shopping session
  const { data: shoppingSession, error: sessionError } = await supabase
    .from('shopping_sessions')
    .insert({
      user_id: user.id,
      ...validation.data,
      status: 'active',
    })
    .select()
    .single()

  if (sessionError) {
    return { error: sessionError.message }
  }

  // Copy items from base list using dynamic ordering from enrichment fields.
  if (baseList.items && baseList.items.length > 0) {
    const orderedItems = [...baseList.items].sort((a, b) => {
      const purchaseA = Number(a?.purchase_count ?? 0)
      const purchaseB = Number(b?.purchase_count ?? 0)
      if (purchaseA !== purchaseB) return purchaseB - purchaseA

      const lastPurchasedA = a?.last_purchased_at ? new Date(a.last_purchased_at).getTime() : 0
      const lastPurchasedB = b?.last_purchased_at ? new Date(b.last_purchased_at).getTime() : 0
      if (lastPurchasedA !== lastPurchasedB) return lastPurchasedB - lastPurchasedA

      return Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0)
    })

    const items = orderedItems.map((item, index) => ({
      shopping_session_id: shoppingSession.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes,
      category: item.category,
      sort_order: index,
      checked: false,
    }))

    const { error: itemsError } = await supabase
      .from('shopping_session_items')
      .insert(items)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

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
      base_list:base_lists(*)
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
      base_list:base_lists(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: shoppingSession }
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
