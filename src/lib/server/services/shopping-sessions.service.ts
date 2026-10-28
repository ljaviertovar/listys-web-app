import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import {
  createShoppingSessionSchema,
  updateShoppingSessionSchema,
  completeShoppingSessionSchema,
  updateShoppingSessionItemSchema,
  createShoppingSessionItemSchema,
} from '@/lib/validations/shopping-session'
import { completeSessionViaRpc } from '@/lib/server/services/complete-session-rpc'
import { mapStartShoppingSessionRpcError } from '@/lib/server/services/rpc-errors'

export async function createShoppingSession(data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = createShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { data: shoppingSession, error } = await supabase.rpc('start_shopping_session', {
    p_base_list_id: validation.data.base_list_id,
    p_name: validation.data.name,
    p_store_id: validation.data.store_id ?? null,
  })

  if (error) throw mapStartShoppingSessionRpcError(error)
  if (!shoppingSession) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')

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
  const { supabase } = await createAuthenticatedClient()

  const validation = completeShoppingSessionSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const sync = await completeSessionViaRpc(supabase, id, validation.data)

  return { success: true, sync }
}

export async function getActiveShoppingSession() {
  const { supabase } = await createAuthenticatedClient()

  // No user_id filter: RLS already restricts to sessions the user owns OR is a collaborator on.
  // This allows invited collaborators to see the shared active session on their dashboard.
  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*),
      base_list:base_lists(
        *,
        collaborators:list_collaborators(id, user_id, role, joined_at)
      ),
      store:stores(id, name)
    `)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  if (!shoppingSession) return null

  // Shape collaborators into lightweight display summaries for the UI
  const baseList = shoppingSession.base_list as { collaborators?: Array<{ user_id: string }> } | null
  const collaborators = (baseList?.collaborators ?? []).map(c => ({
    initials: c.user_id.slice(0, 2).toUpperCase(),
    display_name: null as string | null,
  }))

  return { ...shoppingSession, collaborators }
}

export async function getShoppingSession(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: shoppingSession, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      items:shopping_session_items(*),
      base_list:base_lists(*),
      store:stores(id, name)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  const { data: receipt, error: receiptError } = await supabase
    .from('tickets')
    .select('id, total_amount')
    .eq('shopping_session_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (receiptError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load the attached receipt.')

  return { ...shoppingSession, receipt }
}

export async function getShoppingHistory() {
  const { supabase, user } = await createAuthenticatedClient()

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
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  if (!sessions || sessions.length === 0) return []

  // Count purchased (checked=true) items per session in a single batch query
  const sessionIds = sessions.map(s => s.id)
  const { data: checkedItems } = await supabase
    .from('shopping_session_items')
    .select('shopping_session_id')
    .in('shopping_session_id', sessionIds)
    .eq('checked', true)

  const purchasedCountMap = (checkedItems ?? []).reduce(
    (acc, item) => {
      acc[item.shopping_session_id] = (acc[item.shopping_session_id] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const { data: receipts, error: receiptsError } = await supabase
    .from('tickets')
    .select('id, shopping_session_id')
    .in('shopping_session_id', sessionIds)
    .eq('user_id', user.id)

  if (receiptsError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load receipt links.')
  const receiptMap = new Map((receipts ?? []).map(receipt => [receipt.shopping_session_id, { id: receipt.id }]))

  return sessions.map(s => ({
    ...s,
    purchased_count: purchasedCountMap[s.id] ?? 0,
    receipt: receiptMap.get(s.id) ?? null,
  }))
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
