import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import {
  createShoppingSessionSchema,
  updateShoppingSessionSchema,
  completeShoppingSessionSchema,
  updateShoppingSessionItemSchema,
  createShoppingSessionItemSchema,
} from '@/lib/validations/shopping-session'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

export async function createShoppingSession(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: existingSession } = await supabase
    .from('shopping_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingSession) {
    throw new ApiServiceError(
      409,
      ErrorCode.CONFLICT,
      'You already have an active shopping run. Please complete or cancel it before starting a new one.',
      { activeSessionId: existingSession.id }
    )
  }

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
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Base list not found')
  }

  if (!baseList.items || baseList.items.length === 0) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, 'Cannot create shopping run from an empty base list. Please add items to your base list first.')
  }

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
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, sessionError.message)
  }

  if (baseList.items && baseList.items.length > 0) {
    const orderedItems = [...baseList.items].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const purchaseA = Number(a.purchase_count ?? 0)
      const purchaseB = Number(b.purchase_count ?? 0)
      if (purchaseA !== purchaseB) return purchaseB - purchaseA

      const lastPurchasedA = a.last_purchased_at ? new Date(String(a.last_purchased_at)).getTime() : 0
      const lastPurchasedB = b.last_purchased_at ? new Date(String(b.last_purchased_at)).getTime() : 0
      if (lastPurchasedA !== lastPurchasedB) return lastPurchasedB - lastPurchasedA

      return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    })

    const items = orderedItems.map((item: Record<string, unknown>, index: number) => ({
      shopping_session_id: shoppingSession.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes,
      category: item.category,
      sort_order: index,
      checked: false,
    }))

    const { error: itemsError } = await (supabase as any).from('shopping_session_items').insert(items)

    if (itemsError) {
      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, itemsError.message)
    }
  }

  return shoppingSession
}

export async function updateShoppingSession(id: string, data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = updateShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return shoppingSession
}

export async function completeShoppingSession(id: string, data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = completeShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: shoppingSession, error: sessionError } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !shoppingSession) {
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Shopping run not found')
  }

  const { error: updateError } = await supabase
    .from('shopping_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...validation.data,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, updateError.message)
  }

  if (validation.data.sync_to_base) {
    const { error: syncError } = await (supabase as any).rpc('sync_shopping_session_to_base_list', {
      p_session_id: id,
      p_max_items: MAX_ITEMS_PER_BASE_LIST,
    })

    if (syncError) {
      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Run completed but sync failed: ' + syncError.message)
    }
  }

  return { success: true }
}

export async function getActiveShoppingSession() {
  const { supabase, user } = await createAuthenticatedClient()

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
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return shoppingSession
}

export async function getShoppingSession(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*),
      base_list:base_lists(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return shoppingSession
}

export async function getShoppingHistory() {
  const { supabase, user } = await createAuthenticatedClient()

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
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return sessions
}

export async function updateShoppingSessionItem(id: string, data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = updateShoppingSessionItemSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: item, error } = await supabase
    .from('shopping_session_items')
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

export async function createShoppingSessionItem(data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = createShoppingSessionItemSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: existingItems } = await supabase
    .from('shopping_session_items')
    .select('sort_order')
    .eq('shopping_session_id', validation.data.shopping_session_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingItems?.[0]?.sort_order ? existingItems[0].sort_order + 1 : 0

  const { data: item, error } = await supabase
    .from('shopping_session_items')
    .insert({ ...validation.data, sort_order: nextSortOrder, checked: false })
    .select()
    .single()

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return item
}

export async function deleteShoppingSessionItem(id: string) {
  const { supabase } = await createAuthenticatedClient()

  const { error } = await supabase.from('shopping_session_items').delete().eq('id', id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}

export async function cancelShoppingSession(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { error } = await supabase
    .from('shopping_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}
