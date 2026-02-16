import { test, expect } from '@playwright/test'
import {
  createTestUser,
  createGroup,
  createBaseList,
  createBaseListItems,
  createCompleteSetup,
  resetDatabase,
  cleanTestUsers,
} from '../helpers'
import { createAuthenticatedClient } from '../helpers/supabase-client'

/**
 * RLS Security Tests
 *
 * Critical: Validates that Row Level Security policies prevent cross-user data access
 * Tests both direct DB access and application-level operations
 */

test.describe('RLS Policy Enforcement', () => {
  test.beforeEach(async () => {
    // Clean slate for each test
    await resetDatabase()
    await cleanTestUsers()
  })

  test.afterEach(async () => {
    // Cleanup after each test
    await resetDatabase()
    await cleanTestUsers()
  })

  test('User A cannot read User B groups', async () => {
    // Setup: Create two users with their own groups
    const userA = await createTestUser('test-user-a@example.com')
    const userB = await createTestUser('test-user-b@example.com')

    const groupA = await createGroup(userA.userId, 'User A Group')
    await createGroup(userB.userId, 'User B Group')

    // User B attempts to query groups (should only see their own)
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data: groups, error } = await userBClient.from('groups').select('*')

    expect(error).toBeNull()
    expect(groups).toHaveLength(1)
    expect(groups![0].name).toBe('User B Group')
    expect(groups![0].id).not.toBe(groupA.id)
  })

  test('User B cannot update User A base list', async () => {
    // Setup
    const setupA = await createCompleteSetup({
      userEmail: 'test-user-a@example.com',
      items: [{ name: 'Milk', quantity: 2 }],
    })
    const userB = await createTestUser('test-user-b@example.com')

    // User B attempts to update User A's base list
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data, error } = await userBClient
      .from('base_lists')
      .update({ name: 'Hacked' })
      .eq('id', setupA.baseList.id)
      .select()

    // Should fail due to RLS
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  test('User B cannot insert items into User A base list', async () => {
    // Setup
    const setupA = await createCompleteSetup({
      userEmail: 'test-user-a@example.com',
    })
    const userB = await createTestUser('test-user-b@example.com')

    // User B attempts to insert item into User A's list
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data, error } = await userBClient
      .from('base_list_items')
      .insert({
        base_list_id: setupA.baseList.id,
        name: 'Malicious Item',
        quantity: 1,
        unit: 'unit',
      })
      .select()

    // Should fail due to RLS
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  test('User B cannot delete User A groups', async () => {
    // Setup
    const userA = await createTestUser('test-user-a@example.com')
    const userB = await createTestUser('test-user-b@example.com')
    const groupA = await createGroup(userA.userId, 'User A Group')

    // User B attempts to delete User A's group
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data, error } = await userBClient
      .from('groups')
      .delete()
      .eq('id', groupA.id)
      .select()

    // Should fail due to RLS
    expect(error).not.toBeNull()
    expect(data).toHaveLength(0)
  })

  test('User B cannot read User A shopping sessions', async () => {
    // Setup: User A creates a shopping session
    const setupA = await createCompleteSetup({
      userEmail: 'test-user-a@example.com',
      items: [
        { name: 'Bread', quantity: 1 },
        { name: 'Eggs', quantity: 12 },
      ],
    })

    const userB = await createTestUser('test-user-b@example.com')

    // Create a shopping session for User A (using service role)
    const { createTestClient } = await import('../helpers/supabase-client')
    const adminClient = createTestClient()
    const { data: session } = await adminClient
      .from('shopping_sessions')
      .insert({
        user_id: setupA.user.userId,
        base_list_id: setupA.baseList.id,
        name: 'User A Session',
        status: 'active',
      })
      .select()
      .single()

    expect(session).not.toBeNull()

    // User B attempts to query shopping sessions
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data: sessions, error } = await userBClient
      .from('shopping_sessions')
      .select('*')

    expect(error).toBeNull()
    expect(sessions).toHaveLength(0) // Should not see User A's session
  })

  test('User B cannot read User A tickets', async () => {
    // Setup
    const userA = await createTestUser('test-user-a@example.com')
    const userB = await createTestUser('test-user-b@example.com')
    const groupA = await createGroup(userA.userId)

    // Create ticket for User A
    const { createTestClient } = await import('../helpers/supabase-client')
    const adminClient = createTestClient()
    const { data: ticket } = await adminClient
      .from('tickets')
      .insert({
        user_id: userA.userId,
        group_id: groupA.id,
        ocr_status: 'pending',
      })
      .select()
      .single()

    expect(ticket).not.toBeNull()

    // User B attempts to query tickets
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data: tickets, error } = await userBClient.from('tickets').select('*')

    expect(error).toBeNull()
    expect(tickets).toHaveLength(0) // Should not see User A's ticket
  })

  test('RLS prevents cross-user ticket item merge', async () => {
    // Setup: User A has a base list, User B has a ticket
    const setupA = await createCompleteSetup({
      userEmail: 'test-user-a@example.com',
      items: [{ name: 'Existing Item', quantity: 1 }],
    })

    const userB = await createTestUser('test-user-b@example.com')
    const groupB = await createGroup(userB.userId)

    // Create ticket for User B with items
    const { createTestClient } = await import('../helpers/supabase-client')
    const adminClient = createTestClient()
    const { data: ticketB } = await adminClient
      .from('tickets')
      .insert({
        user_id: userB.userId,
        group_id: groupB.id,
        ocr_status: 'completed',
      })
      .select()
      .single()

    const { data: ticketItems } = await adminClient
      .from('ticket_items')
      .insert([
        {
          ticket_id: ticketB!.id,
          name: 'Malicious Item',
          quantity: 10,
          unit: 'kg',
        },
      ])
      .select()

    expect(ticketItems).toHaveLength(1)

    // User B attempts to call merge RPC targeting User A's base list
    const userBClient = createAuthenticatedClient(userB.userId)
    const { data, error } = await userBClient.rpc('merge_ticket_items_to_base_list', {
      p_ticket_id: ticketB!.id,
      p_base_list_id: setupA.baseList.id,
      p_item_ids: [ticketItems![0].id],
    })

    // Should fail - RPC should validate ownership
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  test('Unauthenticated client cannot access any user data', async () => {
    // Setup: Create user with data
    const setup = await createCompleteSetup({
      items: [{ name: 'Secret Item', quantity: 1 }],
    })

    // Create unauthenticated client (no auth token)
    const { createClient } = await import('@supabase/supabase-js')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Attempt to query groups
    const { data: groups, error: groupsError } = await anonClient
      .from('groups')
      .select('*')

    expect(groupsError).toBeNull()
    expect(groups).toHaveLength(0)

    // Attempt to query base lists
    const { data: lists, error: listsError } = await anonClient
      .from('base_lists')
      .select('*')

    expect(listsError).toBeNull()
    expect(lists).toHaveLength(0)

    // Attempt to query items
    const { data: items, error: itemsError } = await anonClient
      .from('base_list_items')
      .select('*')

    expect(itemsError).toBeNull()
    expect(items).toHaveLength(0)
  })
})
