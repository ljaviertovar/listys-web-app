import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { mergeTicketItemsSchema, createBaseListFromTicketSchema } from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET, MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { getOCRFunctionURL } from '@/lib/config/ocr'
import { z } from 'zod'
import { assertDemoActionAllowed } from '@/lib/demo/policy'

export async function getTickets() {
  const { supabase, user } = await createAuthenticatedClient()

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      group:groups(name),
      base_list:base_lists(id, name)
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
      base_list:base_lists(id, name)
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

  return { ...ticket, items: items || [] }
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
  const { supabase, user } = await createAuthenticatedClient()

  const validation = mergeTicketItemsSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  assertDemoActionAllowed(user, 'merge-ticket-items')

  const { ticket_id, base_list_id, items: itemsToMerge } = validation.data
  const selectedItemIds = itemsToMerge.filter(i => i.merge).map(i => i.id)

  if (selectedItemIds.length === 0) {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'No items to merge')
  }

  const { data: mergeSummary, error: mergeError } = await (supabase as any).rpc('merge_ticket_items_to_base_list', {
    p_ticket_id: ticket_id,
    p_base_list_id: base_list_id,
    p_item_ids: selectedItemIds,
    p_max_items: MAX_ITEMS_PER_BASE_LIST,
  })

  if (mergeError) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, mergeError.message)
  }

  const summary = Array.isArray(mergeSummary) ? mergeSummary[0] : mergeSummary
  return {
    success: true,
    new_count: Number(summary?.new_count ?? 0),
    updated_count: Number(summary?.updated_count ?? 0),
    skipped_count: Number(summary?.skipped_count ?? 0),
  }
}

export async function createBaseListFromTicket(data: unknown) {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createBaseListFromTicketSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  assertDemoActionAllowed(user, 'create-base-list-from-ticket')

  const { ticket_id, group_id, name, item_ids } = validation.data

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

  assertDemoActionAllowed(user, 'delete-ticket')

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

  const schema = z
    .object({
      group_id: z.string().uuid().nullable().optional(),
    })
    .refine(payload => Object.keys(payload).length > 0, {
      message: 'At least one field must be provided',
    })

  const validation = schema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  assertDemoActionAllowed(user, 'update-ticket')

  if (validation.data.group_id !== undefined && validation.data.group_id !== null) {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', validation.data.group_id)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Group not found')
    }
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    throw new ApiServiceError(status, status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR, error.message)
  }

  return ticket
}

export async function retryTicketOCR(id: string) {
  const { supabase, user } = await createAuthenticatedClient()

  assertDemoActionAllowed(user, 'retry-ticket-ocr')

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
    .update({ ocr_status: 'pending', total_items: 0, processed_at: null, ocr_error: null })
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

  assertDemoActionAllowed(user, 'upload-ticket')

  const files = formData.getAll('files') as File[]
  const groupId = formData.get('group_id') as string | null
  const storeName = formData.get('store_name') as string | null

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
