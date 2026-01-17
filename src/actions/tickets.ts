'use server'

import { createClient } from '@/lib/supabase/server'
import { mergeTicketItemsSchema } from '@/lib/validations/ticket'
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
      group:groups(name)
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
      items:ticket_items(*)
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
    return { error: validation.error.errors[0].message }
  }

  const { ticket_id, base_list_id, items: itemsToMerge } = validation.data

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

  // Update ticket to mark it as merged
  await supabase
    .from('tickets')
    .update({ base_list_id })
    .eq('id', ticket_id)

  revalidatePath(`/base-lists/${base_list_id}`)
  revalidatePath('/tickets')
  return { success: true }
}

export async function createBaseListFromTicket(data: {
  ticket_id: string
  group_id: string
  name: string
  item_ids: string[]
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { ticket_id, group_id, name, item_ids } = data

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

  // Update ticket to mark it as merged
  await supabase
    .from('tickets')
    .update({ base_list_id: baseList.id })
    .eq('id', ticket_id)

  revalidatePath(`/groups/${group_id}`)
  revalidatePath('/tickets')
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
