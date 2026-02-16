import { test, expect } from '@playwright/test'
import path from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Ticket Scanning E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should upload and scan ticket image', async ({ page }) => {
    // Navigate to shopping page
    await page.goto(`${BASE_URL}/shopping`)

    // Click scan/upload button
    await page.click('button:has-text("Scan Ticket"), button:has-text("Upload Ticket"), input[type="file"]')

    // Upload test image (assuming we have a test image)
    const testImagePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-ticket.jpg')
    const fileInput = page.locator('input[type="file"]')

    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(testImagePath)
    } else {
      // If file input is hidden, trigger via JavaScript
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        if (input) input.click()
      })
      await fileInput.setInputFiles(testImagePath)
    }

    // Should show processing state
    await expect(page.locator('text=/processing/i, text=/scanning/i, [role="status"]')).toBeVisible({ timeout: 5000 })

    // Wait for OCR to complete (can take 10-30 seconds)
    await expect(page.locator('text=/ticket.*processed/i, text=/scan.*complete/i')).toBeVisible({ timeout: 60000 })
  })

  test('should display ticket items after OCR', async ({ page }) => {
    // Assume previous test created a ticket
    await page.goto(`${BASE_URL}/shopping`)

    // Should see ticket items or ticket group
    await expect(page.locator('[data-testid="ticket-item"], [data-testid="ticket-group"]')).toBeVisible({ timeout: 5000 })

    // Click to view details
    await page.click('[data-testid="ticket-item"], [data-testid="ticket-group"]').first()

    // Should show item details (name, category, etc.)
    await expect(page.locator('[data-testid="item-name"], text=/item/i')).toBeVisible()
  })

  test('should merge ticket items to base list', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Find ticket items
    await page.click('[data-testid="ticket-group"]').first()

    // Select items to merge
    await page.click('input[type="checkbox"]:first-of-type, [data-testid="select-item"]:first-of-type')

    // Click merge button
    await page.click('button:has-text("Merge"), button:has-text("Add to List")')

    // Select target list
    await page.selectOption('select[name="base_list_id"], select[name="listId"]', { index: 0 })
    await page.click('button[type="submit"]:has-text("Merge"), button:has-text("Confirm")')

    // Should show success message
    await expect(page.locator('text=/merged successfully/i, text=/added to list/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle OCR failure gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Upload invalid image (corrupted or non-receipt)
    const invalidImagePath = path.join(process.cwd(), 'e2e', 'fixtures', 'invalid-image.jpg')
    const fileInput = page.locator('input[type="file"]')

    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(invalidImagePath)
    }

    // Wait for processing
    await expect(page.locator('text=/processing/i')).toBeVisible({ timeout: 5000 })

    // Should show error or retry option
    await expect(page.locator('text=/failed/i, text=/error/i, text=/retry/i, [role="alert"]')).toBeVisible({ timeout: 60000 })
  })

  test('should show upload progress for large images', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Upload larger test image
    const largeImagePath = path.join(process.cwd(), 'e2e', 'fixtures', 'large-ticket.jpg')
    const fileInput = page.locator('input[type="file"]')

    await fileInput.setInputFiles(largeImagePath)

    // Should show upload progress
    await expect(page.locator('[role="progressbar"], text=/uploading/i')).toBeVisible({ timeout: 2000 })

    // Eventually should show processing
    await expect(page.locator('text=/processing/i, text=/scanning/i')).toBeVisible({ timeout: 10000 })
  })
})
