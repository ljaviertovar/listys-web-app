'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createShoppingRunSchema,
  updateShoppingRunSchema,
  completeShoppingRunSchema,
  updateShoppingRunItemSchema,
  createShoppingRunItemSchema,
} from '@/lib/validations/shopping-run'
import { revalidatePath } from 'next/cache'

export async function createShoppingRun(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createShoppingRunSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Check if user already has an active shopping run
  const { data: existingRun, error: checkError } = await supabase
    .from('shopping_runs')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingRun) {
    return {
      error: 'You already have an active shopping run. Please complete or cancel it before starting a new one.',
      activeRunId: existingRun.id
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

  // Create shopping run
  const { data: shoppingRun, error: runError } = await supabase
    .from('shopping_runs')
    .insert({
      user_id: user.id,
      ...validation.data,
      status: 'active',
    })
    .select()
    .single()

  if (runError) {
    return { error: runError.message }
  }

  // Copy items from base list
  if (baseList.items && baseList.items.length > 0) {
    const items = baseList.items.map((item: any) => ({
      shopping_run_id: shoppingRun.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes,
      category: item.category,
      sort_order: item.sort_order,
      checked: false,
    }))

    const { error: itemsError } = await supabase
      .from('shopping_run_items')
      .insert(items)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/shopping')
  return { data: shoppingRun }
}

export async function updateShoppingRun(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateShoppingRunSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { data: shoppingRun, error } = await supabase
    .from('shopping_runs')
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
  return { data: shoppingRun }
}

export async function completeShoppingRun(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = completeShoppingRunSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Get shopping run with items
  const { data: shoppingRun, error: runError } = await supabase
    .from('shopping_runs')
    .select(`
      *,
      items:shopping_run_items(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (runError || !shoppingRun) {
    return { error: 'Shopping run not found' }
  }

  // Update shopping run status
  const { error: updateError } = await supabase
    .from('shopping_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...validation.data,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Sync to base list if requested
  if (validation.data.sync_to_base && shoppingRun.items) {
    const { error: syncError } = await syncRunToBaseList(
      supabase,
      shoppingRun.base_list_id,
      shoppingRun.items
    )

    if (syncError) {
      return { error: 'Run completed but sync failed: ' + syncError }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath(`/shopping/${id}`)
  return { success: true }
}

async function syncRunToBaseList(
  supabase: any,
  baseListId: string,
  runItems: any[]
) {
  // Get current base list items
  const { data: baseItems, error: baseError } = await supabase
    .from('base_list_items')
    .select('*')
    .eq('base_list_id', baseListId)

  if (baseError) {
    return { error: baseError.message }
  }

  // Create a map of existing items by name
  const existingItems = new Map(
    baseItems?.map((item: any) => [item.name.toLowerCase(), item]) || []
  )

  const itemsToUpdate: any[] = []
  const itemsToInsert: any[] = []

  runItems.forEach((runItem) => {
    const existing = existingItems.get(runItem.name.toLowerCase())

    if (existing) {
      // Update existing item
      itemsToUpdate.push({
        id: existing.id,
        quantity: runItem.quantity,
        unit: runItem.unit,
        notes: runItem.notes,
        category: runItem.category,
      })
    } else {
      // Insert new item
      itemsToInsert.push({
        base_list_id: baseListId,
        name: runItem.name,
        quantity: runItem.quantity,
        unit: runItem.unit,
        notes: runItem.notes,
        category: runItem.category,
        sort_order: runItem.sort_order,
      })
    }
  })

  // Execute updates
  for (const item of itemsToUpdate) {
    const { error } = await supabase
      .from('base_list_items')
      .update({
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        category: item.category,
      })
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

  return { success: true }
}

export async function getActiveShoppingRun() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: shoppingRun, error } = await supabase
    .from('shopping_runs')
    .select(`
      *,
      items:shopping_run_items(*),
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

  return { data: shoppingRun }
}

export async function getShoppingRun(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: shoppingRun, error } = await supabase
    .from('shopping_runs')
    .select(`
      *,
      items:shopping_run_items(*),
      base_list:base_lists(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: shoppingRun }
}

export async function getShoppingHistory() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: runs, error } = await supabase
    .from('shopping_runs')
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
    return { error: error.message }
  }

  return { data: runs }
}

// Shopping Run Items
export async function updateShoppingRunItem(id: string, data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = updateShoppingRunItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { data: item, error } = await supabase
    .from('shopping_run_items')
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

export async function toggleShoppingRunItem(id: string, checked: boolean) {
  return updateShoppingRunItem(id, { checked })
}

export async function createShoppingRunItem(data: unknown) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validation = createShoppingRunItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Get the max sort_order for this shopping run
  const { data: existingItems } = await supabase
    .from('shopping_run_items')
    .select('sort_order')
    .eq('shopping_run_id', validation.data.shopping_run_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingItems?.[0]?.sort_order ? existingItems[0].sort_order + 1 : 0

  const { data: item, error } = await supabase
    .from('shopping_run_items')
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

  revalidatePath(`/shopping/${validation.data.shopping_run_id}`)
  return { data: item }
}

export async function deleteShoppingRunItem(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('shopping_run_items')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function cancelShoppingRun(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Delete shopping run (items will be deleted via CASCADE)
  const { error } = await supabase
    .from('shopping_runs')
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
