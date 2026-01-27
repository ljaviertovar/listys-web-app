'use server'

import { createClient } from '@/lib/supabase/server'
import { mergeTicketItemsSchema, createBaseListFromTicketSchema } from '@/lib/validations/ticket'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import { revalidatePath } from 'next/cache'

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

  // Get base list with group_id
  const { data: baseList, error: baseListError } = await supabase
    .from('base_lists')
    .select('id, group_id')
    .eq('id', base_list_id)
    .eq('user_id', user.id)
    .single()

  if (baseListError || !baseList) {
    return { error: 'Base list not found' }
  }

  // Get ticket items
  const { data: ticketItems, error: ticketError } = await supabase
    .from('ticket_items')
    .select('*')
    .eq('ticket_id', ticket_id)
    .in(
      'id',
      itemsToMerge.filter((i) => i.merge).map((i) => i.id)
    )

  if (ticketError) {
    return { error: ticketError.message }
  }

  if (!ticketItems || ticketItems.length === 0) {
    return { error: 'No items to merge' }
  }

  // Get existing base list items
  const { data: baseItems, error: baseError } = await supabase
    .from('base_list_items')
    .select('*')
    .eq('base_list_id', base_list_id)

  if (baseError) {
    return { error: baseError.message }
  }

  // Create a map of existing items by name
  const existingItems = new Map(
    baseItems?.map((item: any) => [item.name.toLowerCase(), item]) || []
  )

  const itemsToUpdate: any[] = []
  const itemsToInsert: any[] = []

  ticketItems.forEach((ticketItem) => {
    const existing = existingItems.get(ticketItem.name.toLowerCase())

    if (existing) {
      // Update quantity if item exists
      itemsToUpdate.push({
        id: existing.id,
        quantity: existing.quantity + ticketItem.quantity,
      })
    } else {
      // Insert new item
      itemsToInsert.push({
        base_list_id,
        name: ticketItem.name,
        quantity: ticketItem.quantity,
        unit: ticketItem.unit,
        category: ticketItem.category,
        sort_order: 0,
      })
    }
  })

  // Check if adding new items would exceed the limit
  const currentItemCount = baseItems?.length || 0
  const newItemsCount = itemsToInsert.length

  if (currentItemCount + newItemsCount > MAX_ITEMS_PER_BASE_LIST) {
    return {
      error: `Cannot merge items. This would exceed the maximum limit of ${MAX_ITEMS_PER_BASE_LIST} items per list (current: ${currentItemCount}, trying to add: ${newItemsCount}).`
    }
  }

  // Execute updates
  for (const item of itemsToUpdate) {
    const { error } = await supabase
      .from('base_list_items')
      .update({ quantity: item.quantity })
      .eq('id', item.id)

    if (error) {
      return { error: error.message }
    }
  }

  // Execute inserts
  if (itemsToInsert.length > 0) {
    const { error } = await supabase
      .from('base_list_items')
      .insert(itemsToInsert)

    if (error) {
      return { error: error.message }
    }
  }

  // Update ticket to mark it as merged and inherit group_id from base list
  await supabase
    .from('tickets')
    .update({
      base_list_id,
      group_id: baseList.group_id
    })
    .eq('id', ticket_id)

  revalidatePath(`/base-lists/${base_list_id}`)
  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticket_id}`)
  return { success: true }
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

  revalidatePath(`/ticket-groups/${group_id}`)
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

  // Validate image exists in storage
  const { data: fileExists, error: fileError } = await supabase.storage
    .from('tickets')
    .list(ticket.image_path.split('/')[0], {
      search: ticket.image_path.split('/')[1],
    })

  if (fileError || !fileExists || fileExists.length === 0) {
    return { error: 'Image file not found in storage. The image may have been deleted.' }
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
    })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Generate signed URL for the image
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('tickets')
    .createSignedUrl(ticket.image_path, 3600) // 1 hour expiry

  if (signedUrlError || !signedUrlData?.signedUrl) {
    // Mark as failed if we can't generate URL
    await supabase
      .from('tickets')
      .update({ ocr_status: 'failed' })
      .eq('id', id)
    return { error: 'Failed to generate image URL' }
  }

  // Call edge function to process
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-ticket-ocr`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          ticketId: id,
          imageUrl: signedUrlData.signedUrl,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OCR retry error:', errorText)

      // Mark as failed if Edge Function returns error
      await supabase
        .from('tickets')
        .update({ ocr_status: 'failed' })
        .eq('id', id)

      return { error: 'OCR processing failed. Please try again.' }
    }
  } catch (err) {
    console.error('Failed to trigger OCR:', err)

    // Mark as failed on exception
    await supabase
      .from('tickets')
      .update({ ocr_status: 'failed' })
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
