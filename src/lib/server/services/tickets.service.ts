import { createAuthenticatedClient } from '@/lib/api/auth'
import { isUsablePrice } from '@/utils/is-usable-price'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseWithSchema } from '@/lib/api/zod'
import { mapRpcError, mapTicketSessionAttachRpcError } from '@/lib/server/services/rpc-errors'
import {
  mergeTicketItemsSchema,
  createBaseListFromTicketSchema,
  attachTicketToSessionSchema,
  updateTicketSchema,
  uploadTicketFieldsSchema,
} from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET, MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { getOCRFunctionURL } from '@/lib/config/ocr'
import { resolveListGroupId } from '@/lib/server/services/default-group.service'
import { DUPLICATE_LIST_NAME_MESSAGE, findListByName } from '@/lib/server/services/find-list-by-name'
import type { StoreRef } from '@/types/stores'
import type { Ticket } from '@/types/tickets'

export async function getTickets() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      group:groups(name),
      base_list:base_lists(id, name),
      store:stores(id, name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return tickets
}

export async function getTicket(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      base_list:base_lists(id, name),
      store:stores(id, name)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (ticketError) {
    const status = ticketError.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, ticketError.message)
  }

  const { data: items, error: itemsError } = await supabase.from('ticket_items').select('*').eq('ticket_id', id)

  if (itemsError) {
    console.error('[getTicket] Error fetching items:', itemsError)
  }

  const storeSuggestion = ticket.store_id ? null : await suggestStore(supabase, ticket.store_name)
  let shoppingSession: { id: string; name: string; status: string | null } | null = null
  if (ticket.shopping_session_id) {
    const { data: session, error: sessionError } = await supabase
      .from('shopping_sessions')
      .select('id, name, status')
      .eq('id', ticket.shopping_session_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (sessionError) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load the attached trip.')
    shoppingSession = session
  }

  return { ...ticket, shopping_session: shoppingSession, store_suggestion: storeSuggestion, items: items || [] }
}

/**
 * The store the receipt's raw name resolves to, offered for one-tap confirmation. A failure only costs the suggestion:
 * the receipt still loads, and only the error code is logged.
 */
async function suggestStore(
  supabase: Awaited<ReturnType<typeof createAuthenticatedClient>>['supabase'],
  rawName: string | null
): Promise<StoreRef | null> {
  if (!rawName?.trim()) return null

  const { data: storeId, error } = await supabase.rpc('resolve_store', { p_raw_name: rawName })
  if (error) {
    console.error('[getTicket] could not resolve the store', { code: error.code })
    return null
  }
  if (!storeId) return null

  const { data: store, error: storeError } = await supabase.from('stores').select('id, name').eq('id', storeId).maybeSingle()
  if (storeError) {
    console.error('[getTicket] could not read the suggested store', { code: storeError.code })
    return null
  }

  return store ?? null
}

export async function getTicketStatus(id: string) {
  const { supabase, user } = await createAuthenticatedClient()
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, ocr_status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { ocr_status: ticket?.ocr_status ?? null }
}

export async function mergeTicketItemsToBaseList(data: unknown) {
  const { supabase } = await createAuthenticatedClient()

  const validation = mergeTicketItemsSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { ticket_id, base_list_id, items: itemsToMerge, links } = validation.data
  const selectedItemIds = itemsToMerge.filter(i => i.merge).map(i => i.id)

  if (selectedItemIds.length === 0) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'No items to merge')
  }

  const { data: mergeSummary, error: mergeError } = await supabase.rpc('merge_ticket_items_to_base_list', {
    p_ticket_id: ticket_id,
    p_base_list_id: base_list_id,
    p_item_ids: selectedItemIds,
    p_max_items: MAX_ITEMS_PER_BASE_LIST,
    p_links: links && links.length > 0 ? links : null,
  })

  if (mergeError) {
    throw mapRpcError(mergeError, 'tickets')
  }

  const summary = Array.isArray(mergeSummary) ? mergeSummary[0] : mergeSummary
  return {
    success: true,
    new_count: Number(summary?.new_count ?? 0),
    updated_count: Number(summary?.updated_count ?? 0),
    skipped_count: Number(summary?.skipped_count ?? 0),
  }
}

export type TicketItemMatch = {
  ticket_item_id: string
  match: 'name' | 'alias' | 'none'
  base_list_item: { id: string; name: string } | null
}

/**
 * How every line of the receipt would match the list: an item with the same name, an item remembered from an earlier
 * link, or none (a new item). The same database rules decide the merge, so this preview cannot disagree with it.
 */
export async function getTicketMatches(ticketId: string, baseListId: string): Promise<TicketItemMatch[]> {
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase.rpc('ticket_item_matches', { p_ticket_id: ticketId, p_base_list_id: baseListId })
  if (error) throw mapRpcError(error, 'tickets')

  return (data ?? []).map(row => ({
    ticket_item_id: row.ticket_item_id,
    match: row.match_kind,
    base_list_item: row.base_list_item_id && row.base_list_item_name ? { id: row.base_list_item_id, name: row.base_list_item_name } : null,
  }))
}

export type TicketSessionCandidate = {
  id: string
  name: string
  status: string
  started_at: string | null
  completed_at: string | null
  store: { id: string; name: string } | null
  base_list: { id: string; name: string }
  checked_count: number
  item_count: number
}

export async function getTicketSessionCandidates(ticketId: string): Promise<TicketSessionCandidate[]> {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('ticket_session_candidates', { p_ticket_id: ticketId })
  if (error) throw mapRpcError(error, 'tickets')

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    status: row.status,
    started_at: row.started_at,
    completed_at: row.completed_at,
    store: row.store_id && row.store_name ? { id: row.store_id, name: row.store_name } : null,
    base_list: { id: row.base_list_id, name: row.base_list_name },
    checked_count: row.checked_count,
    item_count: row.item_count,
  }))
}

export async function getTicketSessionMatches(ticketId: string, sessionId: string) {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('ticket_session_matches', {
    p_ticket_id: ticketId,
    p_session_id: sessionId,
  })
  if (error) throw mapRpcError(error, 'tickets')

  return (data ?? []).map(row => ({
    ticket_item_id: row.ticket_item_id,
    match: row.match_kind,
    shopping_session_item: row.shopping_session_item_id && row.shopping_session_item_name
      ? { id: row.shopping_session_item_id, name: row.shopping_session_item_name, checked: row.checked }
      : null,
  }))
}

export async function attachTicketToSession(ticketId: string, input: unknown) {
  const payload = parseWithSchema(attachTicketToSessionSchema, input)
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('attach_receipt_to_session', {
    p_ticket_id: ticketId,
    p_session_id: payload.shopping_session_id,
    p_links: payload.links?.map(link => ({
      ticket_item_id: link.ticket_item_id,
      shopping_session_item_id: link.shopping_session_item_id,
    })) ?? [],
    p_added_item_ids: payload.added_item_ids ?? [],
    ...(payload.total_amount !== undefined ? { p_total_amount: payload.total_amount } : {}),
    p_max_items: MAX_ITEMS_PER_BASE_LIST,
  })

  if (error) throw mapTicketSessionAttachRpcError(error)
  const summary = Array.isArray(data) ? data[0] : data
  if (!summary) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')

  return {
    completed_now: summary.completed_now,
    matched_count: summary.matched_count,
    checked_now_count: summary.checked_now_count,
    added_count: summary.added_count,
    priced_count: summary.priced_count,
    over_limit_count: summary.over_limit_count,
    replayed: summary.replayed,
  }
}

export async function createBaseListFromTicket(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createBaseListFromTicketSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { ticket_id, group_id: requestedGroupId, name, item_ids } = validation.data

  const { data: ticket, error: ticketLookupError } = await supabase
    .from('tickets')
    .select('id, shopping_session_id')
    .eq('id', ticket_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (ticketLookupError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load this receipt.')
  }
  if (!ticket) throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Ticket not found')
  if (ticket.shopping_session_id) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, 'This receipt is already attached to a trip.', {
      reason: 'RECEIPT_ATTACHED',
    })
  }

  const { data: ticketItems, error: ticketError } = await supabase
    .from('ticket_items')
    .select('*')
    .eq('ticket_id', ticket_id)
    .in('id', item_ids)

  if (ticketError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, ticketError.message)
  }

  if (!ticketItems || ticketItems.length === 0) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'No items to add')
  }

  if (ticketItems.length > MAX_ITEMS_PER_BASE_LIST) {
    throw new ApiServiceError(
      409,
      ErrorCode.LIMIT_EXCEEDED,
      `Cannot create list with ${ticketItems.length} items. Maximum allowed is ${MAX_ITEMS_PER_BASE_LIST} items per list.`
    )
  }

  if (await findListByName(supabase, user.id, name)) {
    throw new ApiServiceError(409, ErrorCode.CONFLICT, DUPLICATE_LIST_NAME_MESSAGE)
  }

  const group_id = await resolveListGroupId(supabase, user.id, requestedGroupId)

  const { data: baseList, error: createError } = await supabase
    .from('base_lists')
    .insert({ user_id: user.id, group_id, name })
    .select()
    .single()

  if (createError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, createError.message)
  }

  const itemsToInsert = ticketItems.map((item, index) => ({
    base_list_id: baseList.id,
    name: item.name,
    quantity: item.quantity || 1,
    unit: item.unit,
    category: item.category,
    sort_order: index,
    // The line's price starts the item's average, as merging into a list does.
    average_price: isUsablePrice(item.price) ? item.price : null,
  }))

  const { error: insertError } = await supabase.from('base_list_items').insert(itemsToInsert)

  if (insertError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, insertError.message)
  }

  await supabase.from('tickets').update({ base_list_id: baseList.id, group_id }).eq('id', ticket_id)

  return baseList
}

export async function deleteTicket(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: ticket } = await supabase
    .from('tickets')
    .select('image_path, image_paths')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const imagesToDelete: string[] = []

  if (ticket && typeof ticket === 'object' && !('code' in ticket)) {
    if (Array.isArray((ticket as { image_paths?: string[] }).image_paths)) {
      imagesToDelete.push(...((ticket as { image_paths?: string[] }).image_paths ?? []))
    } else if ((ticket as { image_path?: string | null }).image_path) {
      imagesToDelete.push((ticket as { image_path?: string }).image_path as string)
    }
  }

  if (imagesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage.from('tickets').remove(imagesToDelete)
    if (storageError) {
      console.error('Failed to delete images from storage:', storageError)
    }
  }

  const { error } = await supabase.from('tickets').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}

export async function updateTicket(id: string, data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = updateTicketSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  const { group_id, store_id } = validation.data

  if (group_id !== undefined && group_id !== null) {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', group_id)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Group not found')
    }
  }

  let ticket: Ticket | null = null

  // Assigning a store also teaches the receipt's raw name as an alias of that store, so it goes through the database
  // function that does both in one transaction (and checks that store and receipt are the caller's).
  if (store_id !== undefined) {
    const { data: assigned, error: assignError } = await supabase.rpc('assign_ticket_store', {
      p_ticket_id: id,
      p_store_id: store_id,
    })
    if (assignError || !assigned) throw mapRpcError(assignError ?? {}, 'tickets')
    ticket = assigned
  }

  if (group_id !== undefined) {
    const { data: updated, error } = await supabase
      .from('tickets')
      .update({ group_id })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500
      throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
    }
    ticket = updated
  }

  return ticket
}

export async function retryTicketOCR(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (ticketError || !ticket) {
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Ticket not found')
  }

  const imagePaths: string[] =
    Array.isArray((ticket as unknown as { image_paths?: string[] }).image_paths) &&
    (ticket as unknown as { image_paths: string[] }).image_paths.length > 0
      ? (ticket as unknown as { image_paths: string[] }).image_paths
      : ticket.image_path
        ? [ticket.image_path]
        : []

  if (imagePaths.length === 0) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'No image paths found for this receipt.')
  }

  await supabase.from('ticket_items').delete().eq('ticket_id', id)

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ ocr_status: 'pending', total_items: 0, total_amount: null, processed_at: null, ocr_error: null })
    .eq('id', id)

  if (updateError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, updateError.message)
  }

  const signedUrls: string[] = []
  for (const path of imagePaths) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('tickets').createSignedUrl(path, 3600)
    if (signedUrlError || !signedUrlData?.signedUrl) continue
    signedUrls.push(signedUrlData.signedUrl)
  }

  if (signedUrls.length === 0) {
    await supabase
      .from('tickets')
      .update({ ocr_status: 'failed', ocr_error: 'Failed to generate signed URLs for receipt images.' })
      .eq('id', id)

    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Failed to generate image URL')
  }

  try {
    const response = await fetch(getOCRFunctionURL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ ticketId: id, imageUrls: signedUrls, imageUrl: signedUrls[0] }),
    })

    if (!response.ok) {
      await supabase
        .from('tickets')
        .update({ ocr_status: 'failed', ocr_error: 'OCR processing failed during retry trigger.' })
        .eq('id', id)

      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'OCR processing failed. Please try again.')
    }
  } catch {
    await supabase
      .from('tickets')
      .update({ ocr_status: 'failed', ocr_error: 'Failed to connect to OCR service during retry.' })
      .eq('id', id)

    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Failed to connect to OCR service. Please try again.')
  }

  return { success: true }
}

export async function markStuckTicketsAsFailed() {
  const { supabase } = await createAuthenticatedClient()

  const { error } = await supabase.rpc('mark_stuck_tickets_as_failed')

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return { success: true }
}

export async function assignTicketToGroup(ticketId: string, groupId: string) {
  await updateTicket(ticketId, { group_id: groupId })
  return { success: true }
}

export async function getOrphanedStorageImages() {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('get_orphaned_storage_images')
  if (error) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  return data
}

export async function cleanupOrphanedStorageImages() {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('cleanup_orphaned_storage_images')
  if (error) throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  return data
}

export async function uploadTicket(formData: FormData) {
  const { supabase, user } = await createAuthenticatedClient()

  const files = formData.getAll('files') as File[]
  const groupId = formData.get('group_id') as string | null
  const fields = parseWithSchema(uploadTicketFieldsSchema, { store_name: formData.get('store_name') })
  const storeName = fields.store_name ?? null

  if (!files || files.length === 0) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'No files provided')
  }

  if (files.length > MAX_IMAGES_PER_TICKET) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, `Maximum ${MAX_IMAGES_PER_TICKET} images per ticket`)
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'All files must be images')
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'Each file must be less than 10MB')
    }
  }

  const uploadedPaths: string[] = []
  const timestamp = Date.now()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const name = (file.name || '').toString()
    const parts = name.split('.')
    let ext = parts.length > 1 ? parts.pop()!.toLowerCase() : ''

    if (!ext) {
      ext = (file.type || '').toString().split('/').pop() || ''
    }

    ext = (ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!ext) ext = 'jpg'

    const rand = Math.random().toString(36).slice(2, 8)
    let candidate = `${user.id}/${timestamp}_${i + 1}_${rand}.${ext}`
    candidate = candidate.replace(/[^a-zA-Z0-9-_.\\/]/g, '_')
    candidate = candidate.replace(/_+/g, '_')
    candidate = candidate
      .split('/')
      .map(seg => seg.replace(/^[_\.]+|[_\.]+$/g, ''))
      .join('/')

    const { error: uploadError } = await supabase.storage.from('tickets').upload(candidate, file)

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('tickets').remove(uploadedPaths)
      }
      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, uploadError.message)
    }

    uploadedPaths.push(candidate)
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      user_id: user.id,
      group_id: groupId,
      image_path: uploadedPaths[0],
      image_paths: uploadedPaths,
      store_name: storeName,
      ocr_status: 'pending',
    })
    .select()
    .single()

  if (ticketError) {
    await supabase.storage.from('tickets').remove(uploadedPaths)
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, ticketError.message)
  }

  const signedUrls: string[] = []
  for (const path of uploadedPaths) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('tickets').createSignedUrl(path, 60 * 60)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      continue
    }

    signedUrls.push(signedUrlData.signedUrl)
  }

  if (signedUrls.length === 0) {
    await supabase
      .from('tickets')
      .update({ ocr_status: 'failed', ocr_error: 'Failed to create signed URLs for OCR processing.' })
      .eq('id', ticket.id)

    return { ticketId: ticket.id }
  }

  try {
    fetch(getOCRFunctionURL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ ticketId: ticket.id, imageUrls: signedUrls, imageUrl: signedUrls[0] }),
    }).catch(async () => {
      await supabase
        .from('tickets')
        .update({ ocr_status: 'failed', ocr_error: 'Failed to trigger OCR edge function.' })
        .eq('id', ticket.id)
    })
  } catch {
    // Non-blocking trigger path.
  }

  return { ticketId: ticket.id }
}
