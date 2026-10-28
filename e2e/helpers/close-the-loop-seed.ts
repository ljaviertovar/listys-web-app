import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

type SessionStatus = 'active' | 'completed'

export type CloseTheLoopFixture = {
  email: string
  password: string
  userId: string
  baseListId: string
  itemId: string
  sessionId: string
  ticketId: string
  storeIds: string[]
  getItemState: (normalizedName?: string) => Promise<{ purchase_count: number | null; average_price: number | null } | null>
  cleanup: () => Promise<void>
}

function createLocalAdminClient() {
  const url = process.env.E2E_SUPABASE_URL
  const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Set E2E_SUPABASE_URL and E2E_SUPABASE_SERVICE_ROLE_KEY for local E2E seeding.')

  const hostname = new URL(url).hostname
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)) {
    throw new Error('Receipt reconciliation E2E fixtures may only write to a local Supabase URL.')
  }

  return createClient<Database>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** Seeds only isolated local fixtures; the service key is read from E2E_SUPABASE_* and never has a code default. */
export async function createCloseTheLoopFixture(options: {
  sessionStatus?: SessionStatus
  sessionStore?: string | null
  receiptStore?: string | null
  withStorePrices?: boolean
} = {}): Promise<CloseTheLoopFixture> {
  const supabase = createLocalAdminClient()
  const unique = crypto.randomUUID()
  const email = `close-loop-${unique}@example.test`
  const password = `Local-${unique}-Only!`
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error || !created.data.user) throw new Error(`Could not create local E2E user: ${created.error?.message}`)
  const userId = created.data.user.id

  try {
    const group = await supabase.from('groups').insert({ user_id: userId, name: `Verification ${unique}` }).select('id').single()
    if (group.error || !group.data) throw new Error(`Could not create local E2E group: ${group.error?.message}`)
    const baseList = await supabase.from('base_lists').insert({ user_id: userId, group_id: group.data.id, name: `Trip ${unique}` }).select('id').single()
    if (baseList.error || !baseList.data) throw new Error(`Could not create local E2E list: ${baseList.error?.message}`)
    const item = await supabase.from('base_list_items').insert({
      base_list_id: baseList.data.id,
      name: 'Milk',
      normalized_name: 'milk',
      quantity: 1,
      unit: 'each',
      sort_order: 0,
      purchase_count: options.sessionStatus === 'completed' ? 3 : 0,
      average_price: options.sessionStatus === 'completed' ? 10 : null,
    }).select('id').single()
    if (item.error || !item.data) throw new Error(`Could not create local E2E item: ${item.error?.message}`)

    const storeIds: string[] = []
    const storeNames = options.withStorePrices ? ['North Market', 'South Market'] : [options.sessionStore, options.receiptStore].filter((name): name is string => !!name)
    for (const [index, name] of [...new Set(storeNames)].entries()) {
      const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const store = await supabase.from('stores').insert({ user_id: userId, name, normalized_name: `${normalized}${unique.slice(0, 5)}${index}` }).select('id').single()
      if (store.error || !store.data) throw new Error(`Could not create local E2E store: ${store.error?.message}`)
      storeIds.push(store.data.id)
      const alias = await supabase.from('store_aliases').insert({ user_id: userId, store_id: store.data.id, alias_key: `${normalized}${unique.slice(0, 5)}${index}` })
      if (alias.error) throw new Error(`Could not create local E2E store alias: ${alias.error.message}`)
    }
    const sessionStoreId = options.sessionStore ? storeIds[storeNames.indexOf(options.sessionStore)] ?? null : null
    const receiptStoreId = options.receiptStore ? storeIds[storeNames.indexOf(options.receiptStore)] ?? null : null

    const session = await supabase.from('shopping_sessions').insert({
      user_id: userId,
      base_list_id: baseList.data.id,
      name: 'Weekend trip',
      status: options.sessionStatus ?? 'active',
      completed_at: options.sessionStatus === 'completed' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() : null,
      store_id: sessionStoreId,
      total_amount: 12,
    }).select('id').single()
    if (session.error || !session.data) throw new Error(`Could not create local E2E trip: ${session.error?.message}`)
    const sessionItems = await supabase.from('shopping_session_items').insert([
      { shopping_session_id: session.data.id, name: 'Milk', normalized_name: 'milk', quantity: 1, unit: 'each', price: options.sessionStatus === 'completed' ? 10 : null, checked: options.sessionStatus === 'completed', sort_order: 0 },
      { shopping_session_id: session.data.id, name: 'Unmentioned item', normalized_name: 'unmentioned item', quantity: 1, checked: false, sort_order: 1 },
    ])
    if (sessionItems.error) throw new Error(`Could not create local E2E trip items: ${sessionItems.error.message}`)

    if (options.withStorePrices) {
      const prices = storeIds.map((storeId, index) => ({
        user_id: userId,
        base_list_item_id: item.data.id,
        store_id: storeId,
        purchase_count: 1,
        last_purchased_at: new Date(Date.now() - index * 60_000).toISOString(),
        last_price: index === 0 ? 5 : 3.5,
        last_price_at: new Date(Date.now() - index * 60_000).toISOString(),
        last_quantity: 1,
        last_unit: 'each',
      }))
      const stats = await supabase.from('base_list_item_store_stats').insert(prices)
      if (stats.error) throw new Error(`Could not create local E2E store price rows: ${stats.error.message}`)
    }

    const ticket = await supabase.from('tickets').insert({
      user_id: userId,
      image_path: `e2e/${unique}.jpg`,
      store_name: options.receiptStore ?? null,
      store_id: receiptStoreId,
      ocr_status: 'completed',
      total_items: 2,
      total_amount: 17.25,
      processed_at: new Date().toISOString(),
    }).select('id').single()
    if (ticket.error || !ticket.data) throw new Error(`Could not create local E2E receipt: ${ticket.error?.message}`)
    const receiptItems = await supabase.from('ticket_items').insert([
      { ticket_id: ticket.data.id, name: 'Milk', normalized_name: 'milk', quantity: 1, unit: 'each', price: 4.25 },
      { ticket_id: ticket.data.id, name: 'Apples', normalized_name: 'apples', quantity: 2, unit: 'each', price: 3 },
    ])
    if (receiptItems.error) throw new Error(`Could not create local E2E receipt lines: ${receiptItems.error.message}`)

    return {
      email,
      password,
      userId,
      baseListId: baseList.data.id,
      itemId: item.data.id,
      sessionId: session.data.id,
      ticketId: ticket.data.id,
      storeIds,
      getItemState: async (normalizedName = 'milk') => {
        const result = await supabase.from('base_list_items')
          .select('purchase_count,average_price')
          .eq('base_list_id', baseList.data.id)
          .eq('normalized_name', normalizedName)
          .maybeSingle()
        if (result.error) throw new Error(`Could not read local E2E item state: ${result.error.message}`)
        return result.data
      },
      cleanup: async () => {
        const result = await supabase.auth.admin.deleteUser(userId)
        if (result.error) throw new Error(`Could not remove local E2E user: ${result.error.message}`)
      },
    }
  } catch (error) {
    await supabase.auth.admin.deleteUser(userId)
    throw error
  }
}
