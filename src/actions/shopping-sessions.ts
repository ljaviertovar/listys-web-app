'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createShoppingSessionSchema,
  updateShoppingSessionSchema,
  completeShoppingSessionSchema,
} from '@/lib/validations/shopping-session'
import { ApiServiceError } from '@/lib/api/http'
import { completeSessionViaRpc } from '@/lib/server/services/complete-session-rpc'
import { mapStartShoppingSessionRpcError } from '@/lib/server/services/rpc-errors'
import { revalidatePath } from 'next/cache'
import { updateShoppingSessionItem as updateItem, createShoppingSessionItem as createItem, deleteShoppingSessionItem as deleteItem } from '@/lib/server/services/shopping-sessions.service'

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
  revalidatePath('/trips')
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

  const { data: attachedReceipts, error: receiptError } = await supabase
    .from('tickets')
    .select('id, attached_total_amount, total_items, store:stores(id, name), items:ticket_items(shopping_session_item_id, quantity, unit)')
    .eq('shopping_session_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (receiptError) {
    return { error: receiptError.message }
  }

  const receipts = (attachedReceipts ?? []).map(receipt => ({
    id: receipt.id,
    total_amount: receipt.attached_total_amount,
    store: receipt.store ? { id: receipt.store.id, name: receipt.store.name } : null,
    items_count: receipt.total_items ?? receipt.items?.length ?? 0,
    covered_item_ids: (receipt.items ?? []).flatMap(item => item.shopping_session_item_id ? [item.shopping_session_item_id] : []),
    lines: (receipt.items ?? []).map(item => ({
      shopping_session_item_id: item.shopping_session_item_id,
      quantity: item.quantity,
      unit: item.unit,
    })),
  }))

  return { data: { ...shoppingSession, receipts, receipt: receipts[0] ?? null } }
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
  try { return { data: await updateItem(id, data), error: undefined } }
  catch (error) { return itemActionError(error) }
}

export async function toggleShoppingSessionItem(id: string, checked: boolean, expectedVersion?: number) {
  return updateShoppingSessionItem(id, { checked, ...(expectedVersion !== undefined ? { expected_version: expectedVersion } : {}) })
}

export async function createShoppingSessionItem(data: unknown) {
  try {
    const item = await createItem(data)
    revalidatePath(`/shopping/${item.shopping_session_id}`)
    return { data: item, error: undefined }
  } catch (error) { return itemActionError(error) }
}

export async function deleteShoppingSessionItem(id: string) {
  try { return await deleteItem(id) }
  catch (error) { return itemActionError(error) }
}

function itemActionError(error: unknown) {
  if (error instanceof ApiServiceError) return { data: undefined, error: error.message, errorCode: error.code, details: error.details }
  return { data: undefined, error: 'Could not save this item. Please try again.' }
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
