import { createTestClient } from './supabase-client'
import type { Database } from '@/types'

type Group = Database['public']['Tables']['groups']['Insert']
type BaseList = Database['public']['Tables']['base_lists']['Insert']
type BaseListItem = Database['public']['Tables']['base_list_items']['Insert']
type Ticket = Database['public']['Tables']['tickets']['Insert']

/**
 * Create a test user and return their ID and access token
 */
export async function createTestUser(email?: string) {
  const supabase = createTestClient()
  const testEmail = email || `test-${Date.now()}@example.com`
  const password = 'test-password-123'

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`)
  }

  // Generate an access token for the user
  const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: testEmail,
  })

  if (sessionError || !sessionData) {
    throw new Error(`Failed to generate session: ${sessionError?.message}`)
  }

  return {
    userId: data.user.id,
    email: testEmail,
    password,
  }
}

/**
 * Create a group for testing
 */
export async function createGroup(userId: string, name?: string) {
  const supabase = createTestClient()

  const groupData: Group = {
    user_id: userId,
    name: name || `Test Group ${Date.now()}`,
  }

  const { data, error } = await supabase.from('groups').insert(groupData).select().single()

  if (error || !data) {
    throw new Error(`Failed to create group: ${error?.message}`)
  }

  return data
}

/**
 * Create a base list for testing
 */
export async function createBaseList(userId: string, groupId: string, name?: string) {
  const supabase = createTestClient()

  const baseListData: BaseList = {
    user_id: userId,
    group_id: groupId,
    name: name || `Test List ${Date.now()}`,
  }

  const { data, error } = await supabase.from('base_lists').insert(baseListData).select().single()

  if (error || !data) {
    throw new Error(`Failed to create base list: ${error?.message}`)
  }

  return data
}

/**
 * Create base list items for testing
 */
export async function createBaseListItems(
  baseListId: string,
  items: Array<{ name: string; quantity?: number; unit?: string; category?: string }>
) {
  const supabase = createTestClient()

  const itemsData: BaseListItem[] = items.map((item) => ({
    base_list_id: baseListId,
    name: item.name,
    normalized_name: item.name.toLowerCase().trim(),
    quantity: item.quantity || 1,
    unit: item.unit || 'unit',
    category: item.category || null,
  }))

  const { data, error } = await supabase.from('base_list_items').insert(itemsData).select()

  if (error || !data) {
    throw new Error(`Failed to create base list items: ${error?.message}`)
  }

  return data
}

/**
 * Create a ticket for testing
 */
export async function createTicket(userId: string, groupId?: string) {
  const supabase = createTestClient()

  const ticketData: Ticket = {
    user_id: userId,
    group_id: groupId || null,
    ocr_status: 'pending',
    image_path: `test-image-${Date.now()}.jpg`,
  }

  const { data, error } = await supabase.from('tickets').insert(ticketData).select().single()

  if (error || !data) {
    throw new Error(`Failed to create ticket: ${error?.message}`)
  }

  return data
}

/**
 * Create a complete test setup: user -> group -> base list -> items
 */
export async function createCompleteSetup(options?: {
  userEmail?: string
  groupName?: string
  baseListName?: string
  items?: Array<{ name: string; quantity?: number; unit?: string; category?: string }>
}) {
  const user = await createTestUser(options?.userEmail)
  const group = await createGroup(user.userId, options?.groupName)
  const baseList = await createBaseList(user.userId, group.id, options?.baseListName)

  let items: Awaited<ReturnType<typeof createBaseListItems>> | undefined

  if (options?.items && options.items.length > 0) {
    items = await createBaseListItems(baseList.id, options.items)
  }

  return {
    user,
    group,
    baseList,
    items: items || [],
  }
}

/**
 * Create a receipt that OCR has already read, with its lines, so receipt-review flows can run without the OCR provider.
 */
export async function createReadReceipt(
  userId: string,
  options: { storeName?: string | null; items: Array<{ name: string; quantity?: number; price?: number | null }> }
) {
  const supabase = createTestClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      ocr_status: 'completed',
      image_path: `test-image-${Date.now()}.jpg`,
      store_name: options.storeName ?? null,
      total_items: options.items.length,
      processed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !ticket) {
    throw new Error(`Failed to create receipt: ${error?.message}`)
  }

  const { data: items, error: itemsError } = await supabase
    .from('ticket_items')
    .insert(options.items.map(item => ({ ticket_id: ticket.id, name: item.name, quantity: item.quantity ?? 1, price: item.price ?? null })))
    .select()

  if (itemsError || !items) {
    throw new Error(`Failed to create receipt lines: ${itemsError?.message}`)
  }

  return { ticket, items }
}

/**
 * Create a store of a user with the alias of its own name, as create_store would (that function needs a signed-in caller).
 */
export async function createStore(userId: string, name: string) {
  const supabase = createTestClient()

  const { data: key, error: keyError } = await supabase.rpc('normalize_store_name', { input_text: name })
  if (keyError || !key) {
    throw new Error(`Failed to normalize store name: ${keyError?.message}`)
  }

  const { data: store, error } = await supabase
    .from('stores')
    .insert({ user_id: userId, name, normalized_name: key })
    .select()
    .single()

  if (error || !store) {
    throw new Error(`Failed to create store: ${error?.message}`)
  }

  const { error: aliasError } = await supabase.from('store_aliases').insert({ user_id: userId, store_id: store.id, alias_key: key })
  if (aliasError) {
    throw new Error(`Failed to create store alias: ${aliasError.message}`)
  }

  return store
}
