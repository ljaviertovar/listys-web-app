import { createClient } from '@supabase/supabase-js'

function normalizeEmail(value) {
  return value?.trim().toLowerCase() || ''
}

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const demoUserEmail = normalizeEmail(process.env.DEMO_USER_EMAIL)
  const demoUserPassword = process.env.DEMO_USER_PASSWORD?.trim() || ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  }

  if (process.env.DEMO_MODE_ENABLED !== 'true') {
    throw new Error('DEMO_MODE_ENABLED must be true to manage the public demo.')
  }

  if (!demoUserEmail || !demoUserPassword) {
    throw new Error('Missing DEMO_USER_EMAIL or DEMO_USER_PASSWORD.')
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    demoUserEmail,
    demoUserPassword,
    demoUserId: process.env.DEMO_USER_ID?.trim() || '',
  }
}

function getAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getEnv()

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

const DEMO_IDS = {
  group: '11111111-1111-4111-8111-111111111111',
  baseLists: {
    weeklyGroceries: '22222222-2222-4222-8222-222222222221',
    partyPrep: '22222222-2222-4222-8222-222222222222',
    quickRefill: '22222222-2222-4222-8222-222222222223',
  },
  tickets: {
    weeklyReceipt: '33333333-3333-4333-8333-333333333331',
  },
  sessions: {
    completed: '44444444-4444-4444-8444-444444444441',
    active: '44444444-4444-4444-8444-444444444442',
  },
}

async function ensureDemoUser(admin) {
  const env = getEnv()
  const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`)
  }

  const existingUser = usersPage.users.find(user => normalizeEmail(user.email) === env.demoUserEmail)

  if (existingUser) {
    if (env.demoUserId && existingUser.id !== env.demoUserId) {
      throw new Error(`Configured DEMO_USER_ID (${env.demoUserId}) does not match the existing demo user (${existingUser.id}).`)
    }

    const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
      password: env.demoUserPassword,
      email_confirm: true,
    })

    if (error || !data.user) {
      throw new Error(`Failed to update demo user: ${error?.message || 'Unknown error'}`)
    }

    return data.user
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: env.demoUserEmail,
    password: env.demoUserPassword,
    email_confirm: true,
    user_metadata: {
      name: 'Demo Shopper',
      account_type: 'demo',
    },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create demo user: ${error?.message || 'Unknown error'}`)
  }

  if (env.demoUserId && data.user.id !== env.demoUserId) {
    throw new Error(`Configured DEMO_USER_ID (${env.demoUserId}) does not match the newly created demo user (${data.user.id}).`)
  }

  return data.user
}

async function purgeDemoUserData(admin, userId) {
  const [
    { data: groups },
    { data: baseLists },
    { data: tickets },
    { data: sessions },
  ] = await Promise.all([
    admin.from('groups').select('id').eq('user_id', userId),
    admin.from('base_lists').select('id').eq('user_id', userId),
    admin.from('tickets').select('id, image_path').eq('user_id', userId),
    admin.from('shopping_sessions').select('id').eq('user_id', userId),
  ])

  const groupIds = (groups ?? []).map(group => group.id)
  const baseListIds = (baseLists ?? []).map(baseList => baseList.id)
  const ticketIds = (tickets ?? []).map(ticket => ticket.id)
  const sessionIds = (sessions ?? []).map(session => session.id)
  const imagePaths = (tickets ?? []).map(ticket => ticket.image_path).filter(Boolean)

  if (sessionIds.length > 0) {
    const { error } = await admin.from('shopping_session_items').delete().in('shopping_session_id', sessionIds)
    if (error) throw new Error(`Failed to delete demo shopping session items: ${error.message}`)
  }

  if (ticketIds.length > 0) {
    const { error } = await admin.from('ticket_items').delete().in('ticket_id', ticketIds)
    if (error) throw new Error(`Failed to delete demo ticket items: ${error.message}`)
  }

  if (imagePaths.length > 0) {
    const { error } = await admin.storage.from('tickets').remove(imagePaths)
    if (error) {
      console.warn('[demo] Failed to remove some demo storage images:', error.message)
    }
  }

  const { error: sessionsError } = await admin.from('shopping_sessions').delete().eq('user_id', userId)
  if (sessionsError) throw new Error(`Failed to delete demo shopping sessions: ${sessionsError.message}`)

  const { error: ticketsError } = await admin.from('tickets').delete().eq('user_id', userId)
  if (ticketsError) throw new Error(`Failed to delete demo tickets: ${ticketsError.message}`)

  if (baseListIds.length > 0) {
    const { error } = await admin.from('base_list_items').delete().in('base_list_id', baseListIds)
    if (error) throw new Error(`Failed to delete demo base list items: ${error.message}`)
  }

  const { error: baseListsError } = await admin.from('base_lists').delete().eq('user_id', userId)
  if (baseListsError) throw new Error(`Failed to delete demo base lists: ${baseListsError.message}`)

  if (groupIds.length > 0) {
    const { error } = await admin.from('groups').delete().in('id', groupIds)
    if (error) throw new Error(`Failed to delete demo groups: ${error.message}`)
  }
}

export async function seedDemoUserData() {
  const admin = getAdminClient()
  const demoUser = await ensureDemoUser(admin)
  const userId = demoUser.id

  await purgeDemoUserData(admin, userId)

  const now = new Date().toISOString()
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { error: groupError } = await admin.from('groups').insert({
    id: DEMO_IDS.group,
    user_id: userId,
    name: 'Demo Household',
    description: 'Shared demo workspace with synthetic shopping data.',
  })
  if (groupError) throw new Error(`Failed to create demo group: ${groupError.message}`)

  const { error: baseListsError } = await admin.from('base_lists').insert([
    {
      id: DEMO_IDS.baseLists.weeklyGroceries,
      user_id: userId,
      group_id: DEMO_IDS.group,
      name: 'Weekly Groceries',
      notes: 'Main recurring grocery list used for the demo dashboard and history.',
    },
    {
      id: DEMO_IDS.baseLists.partyPrep,
      user_id: userId,
      group_id: DEMO_IDS.group,
      name: 'Weekend BBQ',
      notes: 'A second list to show how different shopping intents can coexist.',
    },
    {
      id: DEMO_IDS.baseLists.quickRefill,
      user_id: userId,
      group_id: DEMO_IDS.group,
      name: 'Quick Refill',
      notes: 'This list feeds the active shopping session in the shared demo.',
    },
  ])
  if (baseListsError) throw new Error(`Failed to create demo base lists: ${baseListsError.message}`)

  const { error: baseListItemsError } = await admin.from('base_list_items').insert([
    {
      id: '55555555-5555-4555-8555-555555555551',
      base_list_id: DEMO_IDS.baseLists.weeklyGroceries,
      name: 'Milk',
      normalized_name: 'milk',
      quantity: 2,
      unit: 'bottles',
      category: 'Dairy',
      notes: '2% lactose free',
      sort_order: 0,
      purchase_count: 8,
      average_price: 3.49,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555552',
      base_list_id: DEMO_IDS.baseLists.weeklyGroceries,
      name: 'Eggs',
      normalized_name: 'eggs',
      quantity: 12,
      unit: 'units',
      category: 'Dairy',
      notes: 'Large free-range',
      sort_order: 1,
      purchase_count: 6,
      average_price: 4.99,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555553',
      base_list_id: DEMO_IDS.baseLists.weeklyGroceries,
      name: 'Bananas',
      normalized_name: 'bananas',
      quantity: 6,
      unit: 'units',
      category: 'Produce',
      notes: 'For smoothies',
      sort_order: 2,
      purchase_count: 10,
      average_price: 2.75,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555554',
      base_list_id: DEMO_IDS.baseLists.partyPrep,
      name: 'Burger buns',
      normalized_name: 'burger buns',
      quantity: 2,
      unit: 'packs',
      category: 'Bakery',
      notes: 'Brioche if available',
      sort_order: 0,
      purchase_count: 2,
      average_price: 4.29,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      base_list_id: DEMO_IDS.baseLists.partyPrep,
      name: 'Ground beef',
      normalized_name: 'ground beef',
      quantity: 2,
      unit: 'kg',
      category: 'Meat',
      notes: '80/20 mix',
      sort_order: 1,
      purchase_count: 2,
      average_price: 18.5,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555556',
      base_list_id: DEMO_IDS.baseLists.quickRefill,
      name: 'Sparkling water',
      normalized_name: 'sparkling water',
      quantity: 2,
      unit: 'packs',
      category: 'Beverages',
      notes: 'Lime flavor',
      sort_order: 0,
      purchase_count: 4,
      average_price: 5.99,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555557',
      base_list_id: DEMO_IDS.baseLists.quickRefill,
      name: 'Greek yogurt',
      normalized_name: 'greek yogurt',
      quantity: 3,
      unit: 'cups',
      category: 'Dairy',
      notes: 'Vanilla',
      sort_order: 1,
      purchase_count: 5,
      average_price: 1.45,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
    {
      id: '55555555-5555-4555-8555-555555555558',
      base_list_id: DEMO_IDS.baseLists.quickRefill,
      name: 'Avocados',
      normalized_name: 'avocados',
      quantity: 4,
      unit: 'units',
      category: 'Produce',
      notes: 'Ready to eat',
      sort_order: 2,
      purchase_count: 3,
      average_price: 6.2,
      first_seen_at: lastWeek,
      last_purchased_at: yesterday,
    },
  ])
  if (baseListItemsError) throw new Error(`Failed to create demo base list items: ${baseListItemsError.message}`)

  const { error: ticketError } = await admin.from('tickets').insert({
    id: DEMO_IDS.tickets.weeklyReceipt,
    user_id: userId,
    group_id: DEMO_IDS.group,
    base_list_id: DEMO_IDS.baseLists.weeklyGroceries,
    image_path: `${userId}/demo-receipt-weekly.jpg`,
    store_name: 'Neighborhood Market',
    total_items: 4,
    ocr_status: 'completed',
    processed_at: now,
  })
  if (ticketError) throw new Error(`Failed to create demo ticket: ${ticketError.message}`)

  const { error: ticketItemsError } = await admin.from('ticket_items').insert([
    {
      id: '66666666-6666-4666-8666-666666666661',
      ticket_id: DEMO_IDS.tickets.weeklyReceipt,
      name: 'Milk',
      quantity: 2,
      unit: 'bottles',
      category: 'Dairy',
      price: 3.49,
    },
    {
      id: '66666666-6666-4666-8666-666666666662',
      ticket_id: DEMO_IDS.tickets.weeklyReceipt,
      name: 'Eggs',
      quantity: 1,
      unit: 'dozen',
      category: 'Dairy',
      price: 4.99,
    },
    {
      id: '66666666-6666-4666-8666-666666666663',
      ticket_id: DEMO_IDS.tickets.weeklyReceipt,
      name: 'Bananas',
      quantity: 6,
      unit: 'units',
      category: 'Produce',
      price: 2.75,
    },
    {
      id: '66666666-6666-4666-8666-666666666664',
      ticket_id: DEMO_IDS.tickets.weeklyReceipt,
      name: 'Coffee beans',
      quantity: 1,
      unit: 'bag',
      category: 'Pantry',
      price: 12.99,
    },
  ])
  if (ticketItemsError) throw new Error(`Failed to create demo ticket items: ${ticketItemsError.message}`)

  const { error: sessionsError } = await admin.from('shopping_sessions').insert([
    {
      id: DEMO_IDS.sessions.completed,
      user_id: userId,
      base_list_id: DEMO_IDS.baseLists.weeklyGroceries,
      name: 'Weekly Groceries - Last Run',
      status: 'completed',
      sync_to_base: true,
      total_amount: 24.22,
      started_at: lastWeek,
      completed_at: yesterday,
      general_notes: 'Completed demo session used to populate shopping history.',
    },
    {
      id: DEMO_IDS.sessions.active,
      user_id: userId,
      base_list_id: DEMO_IDS.baseLists.quickRefill,
      name: 'Quick Refill - In Progress',
      status: 'active',
      sync_to_base: false,
      total_amount: null,
      started_at: now,
      general_notes: 'Visitors can toggle checklist progress in this active demo session.',
    },
  ])
  if (sessionsError) throw new Error(`Failed to create demo shopping sessions: ${sessionsError.message}`)

  const { error: sessionItemsError } = await admin.from('shopping_session_items').insert([
    {
      id: '77777777-7777-4777-8777-777777777771',
      shopping_session_id: DEMO_IDS.sessions.completed,
      name: 'Milk',
      normalized_name: 'milk',
      quantity: 2,
      unit: 'bottles',
      category: 'Dairy',
      checked: true,
      price: 3.49,
      sort_order: 0,
      notes: 'Bought',
    },
    {
      id: '77777777-7777-4777-8777-777777777772',
      shopping_session_id: DEMO_IDS.sessions.completed,
      name: 'Eggs',
      normalized_name: 'eggs',
      quantity: 1,
      unit: 'dozen',
      category: 'Dairy',
      checked: true,
      price: 4.99,
      sort_order: 1,
      notes: 'Bought',
    },
    {
      id: '77777777-7777-4777-8777-777777777773',
      shopping_session_id: DEMO_IDS.sessions.completed,
      name: 'Bananas',
      normalized_name: 'bananas',
      quantity: 6,
      unit: 'units',
      category: 'Produce',
      checked: false,
      price: 2.75,
      sort_order: 2,
      notes: 'Skipped because they were too ripe',
    },
    {
      id: '77777777-7777-4777-8777-777777777774',
      shopping_session_id: DEMO_IDS.sessions.active,
      name: 'Sparkling water',
      normalized_name: 'sparkling water',
      quantity: 2,
      unit: 'packs',
      category: 'Beverages',
      checked: false,
      price: null,
      sort_order: 0,
      notes: 'Compare club size price',
    },
    {
      id: '77777777-7777-4777-8777-777777777775',
      shopping_session_id: DEMO_IDS.sessions.active,
      name: 'Greek yogurt',
      normalized_name: 'greek yogurt',
      quantity: 3,
      unit: 'cups',
      category: 'Dairy',
      checked: true,
      price: null,
      sort_order: 1,
      notes: 'Already in cart',
    },
    {
      id: '77777777-7777-4777-8777-777777777776',
      shopping_session_id: DEMO_IDS.sessions.active,
      name: 'Avocados',
      normalized_name: 'avocados',
      quantity: 4,
      unit: 'units',
      category: 'Produce',
      checked: false,
      price: null,
      sort_order: 2,
      notes: 'Pick ready-to-eat ones',
    },
  ])
  if (sessionItemsError) throw new Error(`Failed to create demo shopping session items: ${sessionItemsError.message}`)

  return {
    userId,
    email: demoUser.email,
    groupCount: 1,
    baseListCount: 3,
    ticketCount: 1,
    completedSessionCount: 1,
    activeSessionCount: 1,
  }
}

export async function resetDemoUserData() {
  return seedDemoUserData()
}
