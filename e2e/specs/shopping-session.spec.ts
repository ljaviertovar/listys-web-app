import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'
import {
  createCompleteSetup,
  resetDatabase,
  cleanTestUsers,
  createTestClient,
  createTestUser,
} from '../helpers'

type Setup = Awaited<ReturnType<typeof createCompleteSetup>>

/** A client that acts as the user (RLS and auth.uid() apply), which the completion RPC requires. */
async function signInAsUser(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Failed to sign in test user: ${error.message}`)
  return client
}

/** An active session cloned from the setup's base list. */
async function startSession(setup: Setup) {
  const supabase = createTestClient()
  const { data: baseItems } = await supabase.from('base_list_items').select('*').eq('base_list_id', setup.baseList.id)
  const { data: session } = await supabase
    .from('shopping_sessions')
    .insert({ user_id: setup.user.userId, base_list_id: setup.baseList.id, name: 'Shopping Trip', status: 'active' })
    .select()
    .single()

  const { data: sessionItems } = await supabase
    .from('shopping_session_items')
    .insert(
      baseItems!.map((item, index) => ({
        shopping_session_id: session!.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        checked: false,
        sort_order: index,
      })),
    )
    .select()

  return { sessionId: session!.id as string, sessionItems: sessionItems! }
}

/**
 * Shopping Session Lifecycle Tests
 *
 * Critical: Validates session creation, dynamic ordering, and the atomic completion that always syncs back to the base list
 * Tests enrichment updates, quantity changes, and data integrity
 */

test.describe('Shopping Session Lifecycle', () => {
  test.beforeEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test.afterEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test('Create session from base list with dynamic ordering', async () => {
    // Setup: Create base list with items having different enrichment data
    const setup = await createCompleteSetup({
      baseListName: 'Weekly Shopping',
    })

    const supabase = createTestClient()

    // Add items with varying purchase history
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    await supabase.from('base_list_items').insert([
      {
        base_list_id: setup.baseList.id,
        name: 'Frequent Item',
        quantity: 1,
        unit: 'unit',
        purchase_count: 10,
        last_purchased_at: yesterday.toISOString(),
      },
      {
        base_list_id: setup.baseList.id,
        name: 'Recent Item',
        quantity: 1,
        unit: 'unit',
        purchase_count: 2,
        last_purchased_at: yesterday.toISOString(),
      },
      {
        base_list_id: setup.baseList.id,
        name: 'Old Item',
        quantity: 1,
        unit: 'unit',
        purchase_count: 5,
        last_purchased_at: lastWeek.toISOString(),
      },
      {
        base_list_id: setup.baseList.id,
        name: 'Never Bought',
        quantity: 1,
        unit: 'unit',
        purchase_count: 0,
        last_purchased_at: now.toISOString(),
      },
    ])

    // Create shopping session
    const { data: session, error } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: setup.user.userId,
        base_list_id: setup.baseList.id,
        name: 'Test Session',
        status: 'active',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(session).not.toBeNull()

    // Get base list items to clone to session
    const { data: baseListItems } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)
      .order('purchase_count', { ascending: false })
      .order('last_purchased_at', { ascending: false, nullsFirst: false })

    // Clone items to shopping session
    const sessionItems = baseListItems!.map((item, index) => ({
      shopping_session_id: session!.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      checked: false,
      sort_order: index,
    }))

    await supabase.from('shopping_session_items').insert(sessionItems)

    // Verify ordering: Frequent Item (10, yesterday) -> Old Item (5, lastWeek) -> Recent Item (2, yesterday) -> Never Bought (0, null)
    const { data: orderedItems } = await supabase
      .from('shopping_session_items')
      .select('name, sort_order')
      .eq('shopping_session_id', session!.id)
      .order('sort_order')

    expect(orderedItems![0].name).toBe('Frequent Item')
    expect(orderedItems![1].name).toBe('Old Item')
    expect(orderedItems![2].name).toBe('Recent Item')
    expect(orderedItems![3].name).toBe('Never Bought')
  })

  test('Completing a session always updates base list enrichment', async () => {
    const setup = await createCompleteSetup({
      items: [
        { name: 'Milk', quantity: 1, unit: 'L' },
        { name: 'Bread', quantity: 1, unit: 'unit' },
        { name: 'Eggs', quantity: 12, unit: 'unit' },
      ],
    })

    const { sessionId, sessionItems } = await startSession(setup)
    const userClient = await signInAsUser(setup.user.email, setup.user.password)

    const byName = (name: string) => sessionItems.find((item) => item.name === name)!
    const admin = createTestClient()
    await admin.from('shopping_session_items').update({ checked: true, quantity: 2 }).eq('id', byName('Milk').id)
    await admin.from('shopping_session_items').update({ checked: true }).eq('id', byName('Bread').id)
    // Eggs stays unchecked: not purchased.

    const { data: eggsBefore } = await admin
      .from('base_list_items')
      .select('id, purchase_count')
      .eq('base_list_id', setup.baseList.id)
      .eq('name', 'Eggs')
      .single()

    const { data: summary, error } = await userClient.rpc('complete_shopping_session', {
      p_session_id: sessionId,
      p_max_items: 250,
    })

    expect(error).toBeNull()
    expect(summary![0]).toEqual({ new_count: 0, updated_count: 2, skipped_count: 0, over_limit_count: 0 })

    const { data: completed } = await admin.from('shopping_sessions').select('*').eq('id', sessionId).single()
    expect(completed!.status).toBe('completed')
    expect(completed!.completed_at).not.toBeNull()

    const { data: milk } = await admin
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)
      .eq('name', 'Milk')
      .single()
    expect(milk!.purchase_count).toBe(2) // seeded at 1 by the enrichment migration, plus this trip
    expect(milk!.quantity).toBe(2)
    expect(milk!.last_purchased_at).not.toBeNull()

    const { data: eggsAfter } = await admin.from('base_list_items').select('purchase_count').eq('id', eggsBefore!.id).single()
    expect(eggsAfter!.purchase_count).toBe(eggsBefore!.purchase_count) // unchecked items are untouched
  })

  test('Completing a session twice counts the purchase once', async () => {
    const setup = await createCompleteSetup({ items: [{ name: 'Milk', quantity: 1, unit: 'L' }] })
    const { sessionId, sessionItems } = await startSession(setup)
    const userClient = await signInAsUser(setup.user.email, setup.user.password)
    const admin = createTestClient()
    await admin.from('shopping_session_items').update({ checked: true }).eq('id', sessionItems[0].id)

    const first = await userClient.rpc('complete_shopping_session', { p_session_id: sessionId })
    const second = await userClient.rpc('complete_shopping_session', { p_session_id: sessionId })

    expect(first.error).toBeNull()
    expect(second.error?.message).toBe('SESSION_NOT_ACTIVE')

    const { data: item } = await admin
      .from('base_list_items')
      .select('purchase_count')
      .eq('base_list_id', setup.baseList.id)
      .single()
    expect(item!.purchase_count).toBe(2) // seeded at 1 by the enrichment migration, plus one trip
  })

  test('A full base list never blocks completing the trip', async () => {
    const setup = await createCompleteSetup({ items: [{ name: 'Milk', quantity: 1, unit: 'L' }] })
    const { sessionId, sessionItems } = await startSession(setup)
    const userClient = await signInAsUser(setup.user.email, setup.user.password)
    const admin = createTestClient()
    await admin.from('shopping_session_items').update({ checked: true }).eq('id', sessionItems[0].id)
    await admin.from('shopping_session_items').insert({
      shopping_session_id: sessionId,
      name: 'Brand New Item',
      quantity: 1,
      checked: true,
      sort_order: 10,
    })

    // The list already holds one item, so a limit of one leaves no room for the new item.
    const { data: summary, error } = await userClient.rpc('complete_shopping_session', {
      p_session_id: sessionId,
      p_max_items: 1,
    })

    expect(error).toBeNull()
    expect(summary![0]).toEqual({ new_count: 0, updated_count: 1, skipped_count: 1, over_limit_count: 1 })
    const { data: completed } = await admin.from('shopping_sessions').select('status').eq('id', sessionId).single()
    expect(completed!.status).toBe('completed')
  })

  test('Another user cannot complete a session', async () => {
    const setup = await createCompleteSetup({ items: [{ name: 'Milk', quantity: 1, unit: 'L' }] })
    const { sessionId } = await startSession(setup)
    const other = await createTestUser()
    const otherClient = await signInAsUser(other.email, other.password)

    const { error } = await otherClient.rpc('complete_shopping_session', { p_session_id: sessionId })

    expect(error?.message).toBe('SESSION_NOT_FOUND')
  })

  test('Cancel active session removes it', async () => {
    // Setup
    const setup = await createCompleteSetup({
      items: [{ name: 'Item', quantity: 1 }],
    })

    const supabase = createTestClient()

    // Create active session
    const { data: session } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: setup.user.userId,
        base_list_id: setup.baseList.id,
        name: 'To Be Cancelled',
        status: 'active',
      })
      .select()
      .single()

    // Cancel the session through the current delete contract.
    const { error: cancelError } = await supabase
      .from('shopping_sessions')
      .delete()
      .eq('id', session!.id)
    expect(cancelError).toBeNull()

    const { data: cancelledSession } = await supabase
      .from('shopping_sessions')
      .select('id')
      .eq('id', session!.id)
      .maybeSingle()
    expect(cancelledSession).toBeNull()

    // Verify user can create new active session (only 1 active allowed)
    const { data: newSession, error } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: setup.user.userId,
        base_list_id: setup.baseList.id,
        name: 'New Session',
        status: 'active',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(newSession).not.toBeNull()
  })

  test('Session items preserve category and custom fields', async () => {
    // Setup with categorized items
    const setup = await createCompleteSetup()

    const supabase = createTestClient()

    await supabase.from('base_list_items').insert([
      {
        base_list_id: setup.baseList.id,
        name: 'Apple',
        quantity: 2,
        unit: 'kg',
        category: 'Produce',
        purchase_count: 3,
      },
      {
        base_list_id: setup.baseList.id,
        name: 'Yogurt',
        quantity: 4,
        unit: 'unit',
        category: 'Dairy',
        purchase_count: 5,
      },
    ])

    // Create session
    const { data: session } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: setup.user.userId,
        base_list_id: setup.baseList.id,
        name: 'Categorized Session',
        status: 'active',
      })
      .select()
      .single()

    // Get base items
    const { data: baseItems } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)

    // Clone to session
    const sessionItemsData = baseItems!.map((item) => ({
      shopping_session_id: session!.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      checked: false,
    }))

    await supabase.from('shopping_session_items').insert(sessionItemsData)

    // Verify categories preserved
    const { data: sessionItems } = await supabase
      .from('shopping_session_items')
      .select('*')
      .eq('shopping_session_id', session!.id)

    const appleItem = sessionItems!.find((item) => item.name === 'Apple')
    expect(appleItem!.category).toBe('Produce')

    const yogurtItem = sessionItems!.find((item) => item.name === 'Yogurt')
    expect(yogurtItem!.category).toBe('Dairy')
  })
})
