import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Shopping Session E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Create test data: group → list → items
    await page.goto(`${BASE_URL}/shopping-lists`)

    // Step 1: Create a group
    const createGroupBtn = page.locator('[data-testid="create-group-button"]')
    const groupBtnVisible = await createGroupBtn.isVisible({ timeout: 2000 }).catch(() => false)

    if (groupBtnVisible) {
      await createGroupBtn.click()
      await page.fill('input[name="name"]', 'E2E Test Group')
      await page.click('[data-testid="submit-group-button"]')
      await page.waitForTimeout(1500)
    }

    // Step 2: Navigate into the group
    await page.goto(`${BASE_URL}/shopping-lists`)
    const groupCard = page.locator('[data-testid^="group-card-"]').first()
    const hasGroup = await groupCard.isVisible({ timeout: 2000 }).catch(() => false)

    if (hasGroup) {
      await groupCard.click()
      await page.waitForTimeout(1000)
    }

    // Step 3: Create a list within the group
    const createListBtn = page.locator('[data-testid="create-list-button"]')
    const listBtnVisible = await createListBtn.isVisible({ timeout: 2000 }).catch(() => false)

    if (listBtnVisible) {
      await createListBtn.click()
      await page.fill('input[name="name"]', 'E2E Test List')
      await page.click('[data-testid="submit-list-button"]')
      await page.waitForTimeout(2000)
    }
  })

  test('should start shopping session from base list', async ({ page }) => {
    // The list was created in beforeEach, now navigate back to the group
    await page.goto(`${BASE_URL}/shopping-lists`)

    // Click on the group card to enter
    const groupCard = page.locator('[data-testid^="group-card-"]').first()
    await groupCard.click()
    await page.waitForTimeout(1000)

    // Find the list card and click "Start Shopping" button
    const startShoppingBtn = page.locator('[data-testid="start-shopping-button"]').first()
    await startShoppingBtn.click()
    await page.waitForTimeout(500)

    // Confirm in the dialog
    const confirmBtn = page.locator('[data-testid="confirm-start-shopping"]')
    await confirmBtn.click()

    // Should redirect to shopping page with session ID
    await expect(page).toHaveURL(/\/shopping\/[a-f0-9-]+/i, { timeout: 5000 })

    // Should show active session indicator
    await expect(page.locator('text=/active.*session/i, [data-testid="active-session"]')).toBeVisible()

    // Should show items from base list
    await expect(page.locator('[data-testid="shopping-item"], [data-testid="checklist-item"]')).toHaveCount.greaterThan(0)
  })

  test('should sync item checks in real-time', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Ensure we have an active session
    const startButton = page.locator('button:has-text("Start Shopping")')
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click()
    }

    // Get initial checked count
    const initialChecked = await page.locator('[data-testid="shopping-item"][data-checked="true"], input[type="checkbox"]:checked').count()

    // Check an item
    await page.click('[data-testid="shopping-item"]:first-of-type, input[type="checkbox"]:first-of-type')

    // Wait a moment for sync
    await page.waitForTimeout(1000)

    // Verify check persisted (reload page)
    await page.reload()

    const newChecked = await page.locator('[data-testid="shopping-item"][data-checked="true"], input[type="checkbox"]:checked').count()
    expect(newChecked).toBeGreaterThan(initialChecked)
  })

  test('should complete shopping session', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Ensure we have an active session
    const startButton = page.locator('button:has-text("Start Shopping")')
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }

    // Complete session
    await page.click('button:has-text("Complete"), button:has-text("Finish Shopping")')

    // May need to confirm
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")')
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click()
    }

    // Should redirect to history or show success
    await expect(page.locator('text=/completed/i, text=/finished/i, [role="alert"]')).toBeVisible({ timeout: 5000 })

    // Should no longer see active session
    await page.goto(`${BASE_URL}/shopping`)
    await expect(page.locator('text=/no active.*session/i, button:has-text("Start Shopping")')).toBeVisible()
  })

  test('should view shopping history', async ({ page }) => {
    // Navigate to history page
    await page.goto(`${BASE_URL}/shopping-history`)

    // Should see list of past sessions
    await expect(page.locator('[data-testid="history-item"], [data-testid="session-card"]')).toHaveCount.greaterThan(0)

    // Click on a session to view details
    await page.click('[data-testid="history-item"], [data-testid="session-card"]').first()

    // Should show session details (date, items, total, etc.)
    await expect(page.locator('text=/completed.*at/i, text=/finished.*on/i')).toBeVisible()
    await expect(page.locator('[data-testid="session-item"], li')).toHaveCount.greaterThan(0)
  })
})
