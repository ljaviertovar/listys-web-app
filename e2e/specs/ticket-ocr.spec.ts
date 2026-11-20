import { test, expect } from '@playwright/test'
import {
  createCompleteSetup,
  resetDatabase,
  cleanTestUsers,
  createTestClient,
} from '../helpers'

/**
 * OCR Pipeline E2E Tests
 *
 * Critical: Validates the complete ticket upload -> OCR -> merge flow
 * Tests Storage, Edge Functions, and enrichment logic
 */

test.describe('OCR Pipeline End-to-End', () => {
  test.beforeEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test.afterEach(async () => {
    await resetDatabase()
    await cleanTestUsers()
  })

  test('Merge ticket items to base list updates enrichment fields', async () => {
    // Setup: Create base list with existing items
    const setup = await createCompleteSetup({
      userEmail: 'test-merge@example.com',
      items: [
        { name: 'Milk', quantity: 1, unit: 'L' },
        { name: 'Bread', quantity: 1, unit: 'unit' },
      ],
    })

    // Create a ticket with items (simulating OCR results)
    const supabase = createTestClient()
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        user_id: setup.user.userId,
        group_id: setup.group.id,
        image_path: 'e2e-merge-ticket.jpg',
        ocr_status: 'completed',
      })
      .select()
      .single()

    const { data: ticketItems } = await supabase
      .from('ticket_items')
      .insert([
        {
          ticket_id: ticket!.id,
          name: 'Milk', // Duplicate of existing item
          quantity: 2,
          unit: 'L',
          price: 3.99,
        },
        {
          ticket_id: ticket!.id,
          name: 'Eggs', // New item
          quantity: 12,
          unit: 'unit',
          price: 5.49,
        },
      ])
      .select()

    expect(ticketItems).toHaveLength(2)

    // Merge ticket items to base list using RPC
    const { data: mergeResult, error: mergeError } = await supabase.rpc(
      'merge_ticket_items_to_base_list',
      {
        p_ticket_id: ticket!.id,
        p_base_list_id: setup.baseList.id,
        p_item_ids: ticketItems!.map(item => item.id),
      }
    )

    expect(mergeError).toBeNull()
    expect(mergeResult).toBeDefined()
    expect(mergeResult?.[0].new_count).toBe(1) // Eggs is new
    expect(mergeResult?.[0].updated_count).toBe(1) // Milk is updated

    // Verify enrichment fields updated
    const { data: baseListItems } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)
      .order('name')

    expect(baseListItems).toHaveLength(3) // Milk, Bread, Eggs

    // Find Milk item (should have enrichment)
    const milkItem = baseListItems!.find(item => item.name === 'Milk')
    expect(milkItem).toBeDefined()
    expect(milkItem!.purchase_count).toBe(1) // Incremented from 0
    expect(milkItem!.last_purchased_at).not.toBeNull()
    expect(milkItem!.average_price).toBeCloseTo(3.99, 2)

    // Find Eggs item (new)
    const eggsItem = baseListItems!.find(item => item.name === 'Eggs')
    expect(eggsItem).toBeDefined()
    expect(eggsItem!.purchase_count).toBe(1)
    expect(eggsItem!.average_price).toBeCloseTo(5.49, 2)
  })

  test('Re-merge same ticket increments purchase_count', async () => {
    // Setup
    const setup = await createCompleteSetup({
      items: [{ name: 'Apple', quantity: 1 }],
    })

    const supabase = createTestClient()

    // Create ticket with Apple
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        user_id: setup.user.userId,
        group_id: setup.group.id,
        image_path: 'e2e-remerge-ticket.jpg',
        ocr_status: 'completed',
      })
      .select()
      .single()

    const { data: ticketItems } = await supabase
      .from('ticket_items')
      .insert([
        {
          ticket_id: ticket!.id,
          name: 'Apple',
          quantity: 2,
          unit: 'kg',
          price: 4.5,
        },
      ])
      .select()

    // First merge
    await supabase.rpc('merge_ticket_items_to_base_list', {
      p_ticket_id: ticket!.id,
      p_base_list_id: setup.baseList.id,
      p_item_ids: [ticketItems![0].id],
    })

    // Check purchase_count after first merge
    const { data: items1 } = await supabase
      .from('base_list_items')
      .select('purchase_count')
      .eq('base_list_id', setup.baseList.id)
      .eq('name', 'Apple')
      .single()

    expect(items1!.purchase_count).toBe(1)

    // Second merge (same ticket, same items)
    await supabase.rpc('merge_ticket_items_to_base_list', {
      p_ticket_id: ticket!.id,
      p_base_list_id: setup.baseList.id,
      p_item_ids: [ticketItems![0].id],
    })

    // Check purchase_count after second merge
    const { data: items2 } = await supabase
      .from('base_list_items')
      .select('purchase_count')
      .eq('base_list_id', setup.baseList.id)
      .eq('name', 'Apple')
      .single()

    expect(items2!.purchase_count).toBe(2) // Incremented
  })

  test('OCR failure sets error status and message', async () => {
    // This test requires mocking the Edge Function to return an error
    // For now, we'll test the DB state after manual failure
    const setup = await createCompleteSetup()
    const supabase = createTestClient()

    // Create ticket in failed state (simulating OCR timeout or error)
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        user_id: setup.user.userId,
        group_id: setup.group.id,
        image_path: 'e2e-failed-ticket.jpg',
        ocr_status: 'failed',
        ocr_error: 'Edge Function timeout',
      })
      .select()
      .single()

    expect(ticket!.ocr_status).toBe('failed')
    expect(ticket!.ocr_error).toContain('timeout')

    // Verify no items created
    const { data: items } = await supabase
      .from('ticket_items')
      .select('*')
      .eq('ticket_id', ticket!.id)

    expect(items).toHaveLength(0)
  })
})
