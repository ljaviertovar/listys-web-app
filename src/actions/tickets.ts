'use server'

import { createClient } from '@/lib/supabase/server'
import { mergeTicketItemsSchema, createBaseListFromTicketSchema } from '@/lib/validations/ticket'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { revalidatePath } from 'next/cache'
import { getOCRFunctionURL } from '@/lib/config/ocr'

export async function getTickets() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  return { data: tickets }
}

export async function getTicket(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      items:ticket_items(*),
      base_list:base_lists(id, name)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: ticket }
}

export async function mergeTicketItemsToBaseList(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = mergeTicketItemsSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { ticket_id, base_list_id, items: itemsToMerge } = validation.data
  const selectedItemIds = itemsToMerge.filter((i) => i.merge).map((i) => i.id)

  if (selectedItemIds.length === 0) {
    return { error: 'No items to merge' }
  }

  const { data: mergeSummary, error: mergeError } = await (supabase as any).rpc(
    'merge_ticket_items_to_base_list',
    {
      p_ticket_id: ticket_id,
      p_base_list_id: base_list_id,
      p_item_ids: selectedItemIds,
      p_max_items: MAX_ITEMS_PER_BASE_LIST,
    }
  )

  if (mergeError) {
    return { error: mergeError.message }
  }

  const summary = Array.isArray(mergeSummary) ? mergeSummary[0] : mergeSummary
  const newCount = Number(summary?.new_count ?? 0)
  const updatedCount = Number(summary?.updated_count ?? 0)
  const skippedCount = Number(summary?.skipped_count ?? 0)

  revalidatePath(`/base-lists/${base_list_id}`)
  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticket_id}`)
  return {
    success: true,
    new_count: newCount,
    updated_count: updatedCount,
    skipped_count: skippedCount,
  }
}

export async function createBaseListFromTicket(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createBaseListFromTicketSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { ticket_id, group_id, name, item_ids } = validation.data

  // Get ticket items
  const { data: ticketItems, error: ticketError } = await supabase
    .from('ticket_items')
    .select('*')
    .eq('ticket_id', ticket_id)
    .in('id', item_ids)

  if (ticketError) {
    return { error: ticketError.message }
  }

  if (!ticketItems || ticketItems.length === 0) {
    return { error: 'No items to add' }
  }

  // Check if items exceed the limit
  if (ticketItems.length > MAX_ITEMS_PER_BASE_LIST) {
    return {
      error: `Cannot create list with ${ticketItems.length} items. Maximum allowed is ${MAX_ITEMS_PER_BASE_LIST} items per list.`
    }
  }

  // Create new base list
  const { data: baseList, error: createError } = await supabase
    .from('base_lists')
    .insert({
      user_id: user.id,
      group_id,
      name,
    })
    .select()
    .single()

  if (createError) {
    return { error: createError.message }
  }

  // Insert items to base list
  const itemsToInsert = ticketItems.map((item, index) => ({
    base_list_id: baseList.id,
    name: item.name,
    quantity: item.quantity || 1,
    unit: item.unit,
    category: item.category,
    sort_order: index,
  }))

  const { error: insertError } = await supabase
    .from('base_list_items')
    .insert(itemsToInsert)

  if (insertError) {
    return { error: insertError.message }
  }

  // Update ticket to mark it as merged and set group_id
  await supabase
    .from('tickets')
    .update({
      base_list_id: baseList.id,
      group_id
    })
    .eq('id', ticket_id)

  revalidatePath(`/shopping-lists/${group_id}`)
  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticket_id}`)
  return { data: baseList }
}

export async function deleteTicket(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get ticket to delete image from storage
  const { data: ticket } = await supabase
    .from('tickets')
    .select('image_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (ticket?.image_path) {
    await supabase.storage.from('tickets').remove([ticket.image_path])
  }

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tickets')
  return { success: true }
}

export async function retryTicketOCR(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (ticketError || !ticket) {
    return { error: 'Ticket not found' }
  }

  const imagePaths: string[] =
    Array.isArray((ticket as any).image_paths) && (ticket as any).image_paths.length > 0
      ? (ticket as any).image_paths
      : ticket.image_path
        ? [ticket.image_path]
        : []

  if (imagePaths.length === 0) {
    return { error: 'No image paths found for this receipt.' }
  }

  // Delete existing ticket items
  await supabase
    .from('ticket_items')
    .delete()
    .eq('ticket_id', id)

  // Reset status to pending
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      ocr_status: 'pending',
      total_items: 0,
      processed_at: null,
      ocr_error: null,
    })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  const signedUrls: string[] = []
  for (const path of imagePaths) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('tickets')
      .createSignedUrl(path, 3600)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      continue
    }

    signedUrls.push(signedUrlData.signedUrl)
  }

  if (signedUrls.length === 0) {
    await supabase
      .from('tickets')
      .update({
        ocr_status: 'failed',
        ocr_error: 'Failed to generate signed URLs for receipt images.',
      })
      .eq('id', id)
    return { error: 'Failed to generate image URL' }
  }

  // Call edge function to process
  try {
    const response = await fetch(
      getOCRFunctionURL(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          ticketId: id,
          imageUrls: signedUrls,
          imageUrl: signedUrls[0],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OCR retry error:', errorText)

      // Mark as failed if Edge Function returns error
      await supabase
        .from('tickets')
        .update({
          ocr_status: 'failed',
          ocr_error: 'OCR processing failed during retry trigger.',
        })
        .eq('id', id)

      return { error: 'OCR processing failed. Please try again.' }
    }
  } catch (err) {
    console.error('Failed to trigger OCR:', err)

    // Mark as failed on exception
    await supabase
      .from('tickets')
      .update({
        ocr_status: 'failed',
        ocr_error: 'Failed to connect to OCR service during retry.',
      })
      .eq('id', id)

    return { error: 'Failed to connect to OCR service. Please try again.' }
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${id}`)
  return { success: true }
}

export async function markStuckTicketsAsFailed() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Call the database function to mark stuck tickets as failed
  const { error } = await supabase.rpc('mark_stuck_tickets_as_failed')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tickets')
  return { success: true }
}

export async function assignTicketToGroup(ticketId: string, groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify the ticket belongs to the user
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single()

  if (ticketError || !ticket) {
    return { error: 'Ticket not found' }
  }

  // Verify the group belongs to the user
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .eq('user_id', user.id)
    .single()

  if (groupError || !group) {
    return { error: 'Group not found' }
  }

  // Update the ticket with the new group
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ group_id: groupId })
    .eq('id', ticketId)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
  return { success: true }
}

export async function getOrphanedStorageImages() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase.rpc('get_orphaned_storage_images')

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function cleanupOrphanedStorageImages() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase.rpc('cleanup_orphaned_storage_images')

  if (error) {
    return { error: error.message }
  }

  return { data }
}
