import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Shopping Lists E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should create group → list → items flow', async ({ page }) => {
    // Navigate to shopping lists
    await page.goto(`${BASE_URL}/shopping-lists`)

    // Create new group
    await page.click('button:has-text("New Group"), button:has-text("Create Group")')
    await page.fill('input[name="name"], input[placeholder*="group"]', 'E2E Test Group')
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")')

    // Verify group created
    await expect(page.locator('text=E2E Test Group')).toBeVisible({ timeout: 5000 })

    // Create new list
    await page.click('button:has-text("New List"), button:has-text("Create List")')
    await page.fill('input[name="name"], input[placeholder*="list"]', 'E2E Test List')
    await page.selectOption('select[name="group_id"], select[name="groupId"]', { label: 'E2E Test Group' })
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")')

    // Verify list created
    await expect(page.locator('text=E2E Test List')).toBeVisible({ timeout: 5000 })

    // Add items to list
    await page.click('text=E2E Test List')

    // Add first item
    await page.click('button:has-text("Add Item"), button:has-text("New Item")')
    await page.fill('input[name="name"], input[placeholder*="item"]', 'Milk')
    await page.selectOption('select[name="category"]', 'Dairy')
    await page.click('button[type="submit"]:has-text("Add"), button:has-text("Save")')

    // Verify item added
    await expect(page.locator('text=Milk')).toBeVisible({ timeout: 5000 })

    // Add second item
    await page.click('button:has-text("Add Item"), button:has-text("New Item")')
    await page.fill('input[name="name"], input[placeholder*="item"]', 'Bread')
    await page.selectOption('select[name="category"]', 'Bakery')
    await page.click('button[type="submit"]:has-text("Add"), button:has-text("Save")')

    // Verify both items visible
    await expect(page.locator('text=Bread')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Milk')).toBeVisible()
  })

  test('should edit and delete items', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping-lists`)

    // Assume we have a list from previous test or setup
    // Find and click on a list
    await page.click('text=E2E Test List, a[href*="/shopping-lists/"]').first()

    // Edit an item
    await page.click('button[aria-label*="Edit"]:first-of-type, [data-testid="edit-item"]:first-of-type')
    await page.fill('input[name="name"]', 'Whole Milk')
    await page.click('button[type="submit"]:has-text("Save"), button:has-text("Update")')

    // Verify edit
    await expect(page.locator('text=Whole Milk')).toBeVisible({ timeout: 5000 })

    // Delete an item
    const itemCount = await page.locator('[data-testid="list-item"], li').count()
    await page.click('button[aria-label*="Delete"]:first-of-type, [data-testid="delete-item"]:first-of-type')

    // Confirm deletion if modal appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")')
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click()
    }

    // Verify item count decreased
    await expect(page.locator('[data-testid="list-item"], li')).toHaveCount(itemCount - 1, { timeout: 5000 })
  })

  test('should prevent duplicate item names in same list', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping-lists`)
    await page.click('text=E2E Test List, a[href*="/shopping-lists/"]').first()

    // Add first item
    await page.click('button:has-text("Add Item"), button:has-text("New Item")')
    await page.fill('input[name="name"]', 'Duplicate Test Item')
    await page.selectOption('select[name="category"]', 'Other')
    await page.click('button[type="submit"]:has-text("Add"), button:has-text("Save")')

    // Wait for success
    await expect(page.locator('text=Duplicate Test Item')).toBeVisible({ timeout: 5000 })

    // Try to add duplicate
    await page.click('button:has-text("Add Item"), button:has-text("New Item")')
    await page.fill('input[name="name"]', 'Duplicate Test Item')
    await page.selectOption('select[name="category"]', 'Other')
    await page.click('button[type="submit"]:has-text("Add"), button:has-text("Save")')

    // Should show error
    await expect(page.locator('text=/already exists/i, text=/duplicate/i, [role="alert"]')).toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping-lists`)
    await page.click('text=E2E Test List, a[href*="/shopping-lists/"]').first()

    // Try to add item without name
    await page.click('button:has-text("Add Item"), button:has-text("New Item")')
    await page.click('button[type="submit"]:has-text("Add"), button:has-text("Save")')

    // Should show validation error
    await expect(page.locator('text=/required/i, text=/cannot be empty/i')).toBeVisible()
  })
})
