import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import {
  createShoppingSessionSchema,
  updateShoppingSessionSchema,
  completeShoppingSessionSchema,
  createShoppingSessionItemSchema,
} from '@/lib/validations/shopping-session'
import { completeSessionViaRpc } from '@/lib/server/services/complete-session-rpc'
import { mapStartShoppingSessionRpcError } from '@/lib/server/services/rpc-errors'
import { updateSessionItemViaRpc, throwSessionItemRpcError } from './session-item-rpc'
import { toSessionItemDto } from '@/lib/validations/shopping-session-item'
import { parseWithSchema } from '@/lib/api/zod'
import { itemIdParamsSchema } from '@/lib/validations/api/common'

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
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  const { data: attachedReceipts, error: receiptError } = await supabase
    .from('tickets')
    .select('id, attached_total_amount, total_items, store:stores(id, name), items:ticket_items(shopping_session_item_id, quantity, unit)')
    .eq('shopping_session_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (receiptError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load the attached receipt.')

  const receipts = (attachedReceipts ?? []).map(receipt => ({
    id: receipt.id,
    total_amount: receipt.attached_total_amount,
    store: receipt.store ? { id: receipt.store.id, name: receipt.store.name } : null,
    items_count: receipt.total_items ?? receipt.items?.length ?? 0,
    covered_item_ids: (receipt.items ?? []).flatMap(item => item.shopping_session_item_id ? [item.shopping_session_item_id] : []),
    lines: (receipt.items ?? []).map(item => ({ shopping_session_item_id: item.shopping_session_item_id, quantity: item.quantity, unit: item.unit })),
  }))
  return { ...shoppingSession, receipts, receipt: receipts[0] ?? null }
}

const AVAILABLE_RECEIPTS_LIMIT = 50

/**
 * The owner's receipts that can still be attached to this trip: read, attached nowhere, not added to a list, and either
 * uploaded outside any trip or from this one. Different stores are allowed; the atomic attach operation enforces one receipt per confirmed store.
 */
export async function listAvailableReceipts(sessionId: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: session, error: sessionError } = await supabase
    .from('shopping_sessions')
    .select('id, status, store_id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (sessionError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load the trip.')
  if (!session) throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Not found')

  // sessionId is a validated UUID, so interpolating it into the filter cannot widen the query.
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, created_at, total_amount, total_items, store_id, store:stores(id, name)')
    .eq('user_id', user.id)
    .eq('ocr_status', 'completed')
    .is('shopping_session_id', null)
    .is('base_list_id', null)
    .or(`uploaded_from_session_id.is.null,uploaded_from_session_id.eq.${sessionId}`)
    .order('created_at', { ascending: false })
    .limit(AVAILABLE_RECEIPTS_LIMIT)

  if (error) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load your receipts.')

  return (tickets ?? []).map(ticket => {
    return {
      id: ticket.id,
      created_at: ticket.created_at,
      store: ticket.store ? { id: ticket.store.id, name: ticket.store.name } : null,
      total_amount: ticket.total_amount,
      item_count: ticket.total_items ?? 0,
      selectable: true,
      reason: null,
    }
  })
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
    .select('id, shopping_session_id, attached_total_amount, total_items, store:stores(id, name)')
    .in('shopping_session_id', sessionIds)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (receiptsError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load receipt links.')
  return sessions.map(s => {
    const sessionReceipts = (receipts ?? []).filter(receipt => receipt.shopping_session_id === s.id).map(receipt => ({
      id: receipt.id, total_amount: receipt.attached_total_amount,
      items_count: receipt.total_items ?? 0,
      store: receipt.store ? { id: receipt.store.id, name: receipt.store.name } : null,
    }))
    return { ...s, purchased_count: purchasedCountMap[s.id] ?? 0, receipts: sessionReceipts, receipt: sessionReceipts[0] ?? null }
  })
}

export async function updateShoppingSessionItem(id: string, data: unknown) {
  const { supabase } = await createAuthenticatedClient()
  return updateSessionItemViaRpc(supabase, id, data)
}

export async function createShoppingSessionItem(data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = createShoppingSessionItemSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const input = validation.data
  const { data: item, error } = await supabase.rpc('create_shopping_session_item_active', {
    p_session_id: input.shopping_session_id,
    p_fields: { name: input.name, quantity: input.quantity,
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}) },
  })
  if (error) throwSessionItemRpcError(error)
  try { return toSessionItemDto(item) }
  catch { throwSessionItemRpcError({ message: 'INVALID_RPC_RESPONSE' }) }
}

export async function deleteShoppingSessionItem(id: string) {
  const { supabase } = await createAuthenticatedClient()
  parseWithSchema(itemIdParamsSchema, { itemId: id })
  const { error } = await supabase.rpc('delete_shopping_session_item_active', { p_item_id: id })
  if (error) throwSessionItemRpcError(error)
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
