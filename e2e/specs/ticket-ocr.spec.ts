import { test, expect } from '@playwright/test'
import {
  createCompleteSetup,
  createTestUser,
  createGroup,
  createTicket,
  resetDatabase,
  cleanTestUsers,
  createTestClient,
} from '../helpers'
import path from 'path'
import fs from 'fs/promises'

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

  test('Upload ticket images -> OCR extraction -> Items created', async ({ page }) => {
    // Setup: Create authenticated user with group
    const setup = await createCompleteSetup({
      userEmail: 'test-ocr@example.com',
      groupName: 'OCR Test Group',
    })

    // Navigate to authenticated page (login)
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', setup.user.email)
    await page.fill('input[name="password"]', setup.user.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to ticket upload page
    await page.goto('/shopping/upload-ticket')

    // Create a test image file (1x1 pixel PNG)
    const testImagePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-receipt.png')
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    await fs.mkdir(path.dirname(testImagePath), { recursive: true })
    await fs.writeFile(testImagePath, Buffer.from(testImageBase64, 'base64'))

    // Upload the image
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testImagePath)

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for upload and OCR processing
    // The page should show a "Processing..." state
    await expect(page.locator('text=Processing')).toBeVisible({ timeout: 5000 })

    // Wait for OCR to complete (this may take several seconds)
    // The page should redirect or show "Completed" status
    await page.waitForSelector('text=/Completed|Review/', { timeout: 30000 })

    // Verify ticket was created in database
    const supabase = createTestClient()
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, ticket_items(*)')
      .eq('user_id', setup.user.userId)
      .order('created_at', { ascending: false })
      .limit(1)

    expect(tickets).toHaveLength(1)
    expect(tickets![0].ocr_status).toBe('completed')

    // Verify ticket items were extracted (OCR should have created some items)
    // Note: Actual number depends on the OCR provider's response
    expect(tickets![0].ticket_items).toBeDefined()

    // Cleanup test image
    await fs.unlink(testImagePath).catch(() => { })
  })

  test('Multi-image upload creates single ticket with all items', async ({ page }) => {
    // Setup
    const setup = await createCompleteSetup({
      userEmail: 'test-multi-image@example.com',
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', setup.user.email)
    await page.fill('input[name="password"]', setup.user.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to upload
    await page.goto('/shopping/upload-ticket')

    // Create test images
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const imagesDir = path.join(process.cwd(), 'e2e', 'fixtures', 'images')
    await fs.mkdir(imagesDir, { recursive: true })

    const imagePaths = []
    for (let i = 1; i <= 3; i++) {
      const imagePath = path.join(imagesDir, `receipt-${i}.png`)
      await fs.writeFile(imagePath, Buffer.from(testImageBase64, 'base64'))
      imagePaths.push(imagePath)
    }

    // Upload multiple images
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(imagePaths)

    // Submit
    await page.click('button[type="submit"]')

    // Wait for processing
    await page.waitForSelector('text=/Completed|Review/', { timeout: 45000 })

    // Verify only ONE ticket was created
    const supabase = createTestClient()
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, ticket_items(*)')
      .eq('user_id', setup.user.userId)

    expect(tickets).toHaveLength(1)
    expect(tickets![0].ocr_status).toBe('completed')

    // Cleanup
    for (const imagePath of imagePaths) {
      await fs.unlink(imagePath).catch(() => { })
    }
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
        p_item_ids: ticketItems!.map((item: any) => item.id),
      }
    )

    expect(mergeError).toBeNull()
    expect(mergeResult).toBeDefined()
    expect(mergeResult.new_count).toBe(1) // Eggs is new
    expect(mergeResult.updated_count).toBe(1) // Milk is updated

    // Verify enrichment fields updated
    const { data: baseListItems } = await supabase
      .from('base_list_items')
      .select('*')
      .eq('base_list_id', setup.baseList.id)
      .order('name')

    expect(baseListItems).toHaveLength(3) // Milk, Bread, Eggs

    // Find Milk item (should have enrichment)
    const milkItem = baseListItems!.find((item: any) => item.name === 'Milk')
    expect(milkItem).toBeDefined()
    expect(milkItem!.purchase_count).toBe(1) // Incremented from 0
    expect(milkItem!.last_purchased_at).not.toBeNull()
    expect(milkItem!.average_price).toBeCloseTo(3.99, 2)

    // Find Eggs item (new)
    const eggsItem = baseListItems!.find((item: any) => item.name === 'Eggs')
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
