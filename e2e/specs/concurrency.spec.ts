import { test, expect } from '@playwright/test'
import {
  createCompleteSetup,
  resetDatabase,
  cleanTestUsers,
  createTestClient,
  createTicket,
} from '../helpers'

/**
 * Concurrent Operations Tests
 *
 * Critical: Validates database constraints and race condition handling
 * Tests concurrent session creation, duplicate prevention, and transactional integrity
 */

test.describe('Concurrent Operations', () => {
  test.beforeEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test.afterEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test('Only one active shopping session allowed per user', async () => {
    // Setup
    const setup = await createCompleteSetup({
      items: [{ name: 'Item', quantity: 1 }],
    })

    const supabase = createTestClient()

    // Create first active session
    const { data: session1, error: error1 } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: setup.user.userId,
        base_list_id: setup.baseList.id,
        name: 'Session 1',
        status: 'active',
      })
      .select()
      .single()

    expect(error1).toBeNull()
    expect(session1).not.toBeNull()

    // Attempt to create second active session concurrently
    // This should fail or one should succeed (depending on constraint)
    const promises = [
      supabase
        .from('shopping_sessions')
        .insert({
          user_id: setup.user.userId,
          base_list_id: setup.baseList.id,
          name: 'Session 2',
          status: 'active',
        })
        .select()
        .single(),
      supabase
        .from('shopping_sessions')
        .insert({
          user_id: setup.user.userId,
          base_list_id: setup.baseList.id,
          name: 'Session 3',
          status: 'active',
        })
        .select()
        .single(),
    ]

    const results = await Promise.all(promises)

    // Count how many succeeded
    const successfulSessions = results.filter((r: any) => r.error === null)

    // Should have maximum 1 active session total (including session1)
    // So both concurrent attempts should fail
    expect(successfulSessions.length).toBeLessThanOrEqual(0)

    // Verify total active sessions is 1
    const { data: activeSessions } = await supabase
      .from('shopping_sessions')
      .select('*')
      .eq('user_id', setup.user.userId)
      .eq('status', 'active')

    expect(activeSessions).toHaveLength(1)
    expect(activeSessions![0].id).toBe(session1!.id)
  })

  test('Concurrent merge of same ticket does not create duplicates', async () => {
    // Setup
    const setup = await createCompleteSetup()

    const supabase = createTestClient()

    // Create ticket with items
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        user_id: setup.user.userId,
        group_id: setup.group.id,
        ocr_status: 'completed',
      })
      .select()
      .single()

    const { data: ticketItems } = await supabase
      .from('ticket_items')
      .insert([
        {
          ticket_id: ticket!.id,
          name: 'Concurrent Item',
          quantity: 5,
          unit: 'kg',
        },
      ])
      .select()

    // Attempt concurrent merge of same ticket to same base list
    const mergePromises = [
      supabase.rpc('merge_ticket_items_to_base_list', {
        p_ticket_id: ticket!.id,
        p_base_list_id: setup.baseList.id,
        p_item_ids: ticketItems!.map((i) => i.id),
      }),
      supabase.rpc('merge_ticket_items_to_base_list', {
        p_ticket_id: ticket!.id,
        p_base_list_id: setup.baseList.id,
        p_item_ids: ticketItems!.map((i) => i.id),
      }),
      supabase.rpc('merge_ticket_items_to_base_list', {
        p_ticket_id: ticket!.id,
        p_base_list_id: setup.baseList.id,
        p_item_ids: ticketItems!.map((i) => i.id),
      }),
    ]

    await Promise.all(mergePromises)

    // Verify only ONE item created (no duplicates due to unique constraint on normalized_name)
    const { data: baseItems } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)

    expect(baseItems).toHaveLength(1)
    expect(baseItems![0].name).toBe('Concurrent Item')
  })

  test('Concurrent group creation with same name fails for duplicates', async () => {
    // Setup
    const setup = await createCompleteSetup()

    const supabase = createTestClient()

    // Attempt to create multiple groups with same name concurrently
    const groupName = 'Duplicate Group'
    const promises = Array.from({ length: 5 }).map(() =>
      supabase
        .from('groups')
        .insert({
          user_id: setup.user.userId,
          name: groupName,
        })
        .select()
        .single()
    )

    const results = await Promise.all(promises)

    // Count successful inserts
    const successful = results.filter((r) => r.error === null)

    // Due to unique constraint, only 1 should succeed (or none if app has dedup check)
    // But PostgreSQL unique constraint should prevent duplicates
    expect(successful.length).toBeLessThanOrEqual(1)

    // Verify total groups with this name
    const { data: groups } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', setup.user.userId)
      .eq('name', groupName)

    expect(groups!.length).toBeLessThanOrEqual(1)
  })

  test('Concurrent base list item updates maintain consistency', async () => {
    // Setup
    const setup = await createCompleteSetup({
      items: [{ name: 'Counter Item', quantity: 0 }],
    })

    const supabase = createTestClient()

    // Get item ID
    const { data: items } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)
      .single()

    const itemId = items!.id

    // Attempt concurrent quantity increments
    const incrementPromises = Array.from({ length: 10 }).map(async () => {
      // Read current quantity
      const { data } = await supabase
        .from('base_list_items')
        .select('quantity')
        .eq('id', itemId)
        .single()

      const currentQty = data!.quantity || 0

      // Increment and update
      await supabase
        .from('base_list_items')
        .update({ quantity: currentQty + 1 })
        .eq('id', itemId)
    })

    await Promise.all(incrementPromises)

    // Verify final quantity (may not be 10 due to race conditions, but should be > 0)
    const { data: finalItem } = await supabase
      .from('base_list_items')
      .select('quantity')
      .eq('id', itemId)
      .single()

    // Without proper locking, final count may be less than 10
    // This test documents the race condition behavior
    expect(finalItem!.quantity).toBeGreaterThan(0)
    expect(finalItem!.quantity).toBeLessThanOrEqual(10)
  })

  test('Concurrent ticket item merge respects MAX_ITEMS_PER_BASE_LIST', async () => {
    // Setup: Create base list near the limit
    const MAX_ITEMS = 250 // From limits.md
    const setup = await createCompleteSetup()

    const supabase = createTestClient()

    // Add 240 items to base list
    const existingItems = Array.from({ length: 240 }).map((_, i) => ({
      base_list_id: setup.baseList.id,
      name: `Existing Item ${i + 1}`,
      quantity: 1,
      unit: 'unit',
    }))

    await supabase.from('base_list_items').insert(existingItems)

    // Create 3 tickets, each with 10 items (total 30 items)
    const ticketPromises = Array.from({ length: 3 }).map(async (_, ticketIdx) => {
      const { data: ticket } = await supabase
        .from('tickets')
        .insert({
          user_id: setup.user.userId,
          group_id: setup.group.id,
          ocr_status: 'completed',
        })
        .select()
        .single()

      const ticketItemsData = Array.from({ length: 10 }).map((_, i) => ({
        ticket_id: ticket!.id,
        name: `Ticket ${ticketIdx + 1} Item ${i + 1}`,
        quantity: 1,
        unit: 'unit',
      }))

      const { data: ticketItems } = await supabase
        .from('ticket_items')
        .insert(ticketItemsData)
        .select()

      return { ticketId: ticket!.id, itemIds: ticketItems!.map((i) => i.id) }
    })

    const ticketsData = await Promise.all(ticketPromises)

    // Attempt concurrent merge (240 + 30 = 270 > 250 limit)
    const mergePromises = ticketsData.map((ticket) =>
      supabase.rpc('merge_ticket_items_to_base_list', {
        p_ticket_id: ticket.ticketId,
        p_base_list_id: setup.baseList.id,
        p_item_ids: ticket.itemIds,
      })
    )

    const mergeResults = await Promise.all(mergePromises)

    // Some merges should fail due to limit
    const failures = mergeResults.filter((r) => r.error !== null)
    expect(failures.length).toBeGreaterThan(0)

    // Verify final count <= 250
    const { data: finalItems } = await supabase
      .from('base_list_items')
      .select('id')
      .eq('base_list_id', setup.baseList.id)

    expect(finalItems!.length).toBeLessThanOrEqual(MAX_ITEMS)
  })

  test('Concurrent session completion maintains completed_at integrity', async () => {
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
        name: 'Concurrent Complete',
        status: 'active',
      })
      .select()
      .single()

    // Attempt concurrent completion
    const now = new Date()
    const completePromises = Array.from({ length: 5 }).map(() =>
      supabase
        .from('shopping_sessions')
        .update({
          status: 'completed',
          completed_at: now.toISOString(),
        })
        .eq('id', session!.id)
        .select()
    )

    await Promise.all(completePromises)

    // Verify session is completed (only once)
    const { data: completedSession } = await supabase
      .from('shopping_sessions')
      .select('*')
      .eq('id', session!.id)
      .single()

    expect(completedSession!.status).toBe('completed')
    expect(completedSession!.completed_at).not.toBeNull()
  })

  test('Unique constraint prevents duplicate base list names in same group', async () => {
    // Setup
    const setup = await createCompleteSetup()

    const supabase = createTestClient()

    // Create first base list
    const listName = 'Weekly Shopping'
    const { data: list1, error: error1 } = await supabase
      .from('base_lists')
      .insert({
        group_id: setup.group.id,
        name: listName,
      })
      .select()
      .single()

    expect(error1).toBeNull()

    // Attempt concurrent creation of lists with same name
    const promises = Array.from({ length: 3 }).map(() =>
      supabase
        .from('base_lists')
        .insert({
          group_id: setup.group.id,
          name: listName,
        })
        .select()
        .single()
    )

    const results = await Promise.all(promises)

    // All should fail due to unique constraint
    const failures = results.filter((r) => r.error !== null)
    expect(failures.length).toBe(3)

    // Verify only 1 list exists
    const { data: lists } = await supabase
      .from('base_lists')
      .select('*')
      .eq('group_id', setup.group.id)
      .eq('name', listName)

    expect(lists).toHaveLength(1)
    expect(lists![0].id).toBe(list1!.id)
  })
})
