import { test, expect, type Page } from '@playwright/test'
import path from 'path'

import { createCompleteSetup, createReadReceipt, createStore, createTestUser } from '../helpers'

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
    await page.locator('[data-testid="ticket-item"], [data-testid="ticket-group"]').first().click()

    // Should show item details (name, category, etc.)
    await expect(page.locator('[data-testid="item-name"], text=/item/i')).toBeVisible()
  })

  test('should merge ticket items to base list', async ({ page }) => {
    await page.goto(`${BASE_URL}/shopping`)

    // Find ticket items
    await page.locator('[data-testid="ticket-group"]').first().click()

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

// PRD v3 Phase 3. Receipts are seeded already read, so these flows do not depend on the OCR provider.
test.describe('Receipt stores and item matching', () => {
  async function signIn(page: Page, email: string, password: string) {
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  }

  async function addLineToList(page: Page, ticketItemId: string, listName: string) {
    await page.locator(`[data-testid="ticket-item-row-${ticketItemId}"] [role="checkbox"]`).click()
    await page.getByRole('button', { name: 'Add to a List' }).click()
    const sheet = page.getByTestId('merge-to-base-list-dialog')
    await sheet.getByRole('combobox').click()
    await page.getByRole('option', { name: listName }).click()
    await sheet.getByRole('button', { name: 'Add 1 Item' }).click()
  }

  test('the upload sheet asks for photos only', async ({ page }) => {
    const user = await createTestUser()
    await signIn(page, user.email, user.password)

    await page.goto(`${BASE_URL}/tickets`)
    await page.getByRole('button', { name: /upload/i }).first().click()

    const sheet = page.getByTestId('upload-ticket-dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByLabel(/store|receipt name/i)).toHaveCount(0)
  })

  test('confirms the suggested store with one tap', async ({ page }) => {
    const user = await createTestUser()
    await createStore(user.userId, 'No Frills')
    const { ticket } = await createReadReceipt(user.userId, { storeName: 'NOFRILLS #3127', items: [{ name: 'BREAD', price: 3 }] })
    await signIn(page, user.email, user.password)

    await page.goto(`${BASE_URL}/tickets/${ticket.id}`)
    const card = page.getByTestId('ticket-store-card')
    await expect(card).toHaveAttribute('data-state', 'suggested')
    await card.getByRole('button', { name: 'Confirm' }).click()

    await expect(card).toHaveAttribute('data-state', 'confirmed', { timeout: 10000 })
    await expect(page.getByRole('heading', { level: 1, name: 'No Frills' })).toBeVisible()
  })

  test('saves an unknown store as a new store with a cleaned-up name', async ({ page }) => {
    const user = await createTestUser()
    const { ticket } = await createReadReceipt(user.userId, { storeName: 'FRESH CO #12', items: [{ name: 'APPLES' }] })
    await signIn(page, user.email, user.password)

    await page.goto(`${BASE_URL}/tickets/${ticket.id}`)
    const card = page.getByTestId('ticket-store-card')
    await expect(card).toHaveAttribute('data-state', 'unmatched')
    await card.getByRole('button', { name: 'Save as New Store' }).click()

    const dialog = page.getByTestId('ticket-store-save-dialog')
    await expect(dialog.getByLabel(/store name/i)).toHaveValue('Fresh Co')
    await dialog.getByRole('button', { name: 'Save Store' }).click()

    await expect(card).toHaveAttribute('data-state', 'confirmed', { timeout: 10000 })
    await expect(card.getByRole('heading', { name: 'Fresh Co' })).toBeVisible()
  })

  test('adds items without confirming the store', async ({ page }) => {
    const setup = await createCompleteSetup({ baseListName: 'Pantry', items: [{ name: 'Bread' }] })
    const { ticket, items } = await createReadReceipt(setup.user.userId, { storeName: 'Somewhere', items: [{ name: 'BREAD' }] })
    await signIn(page, setup.user.email, setup.user.password)

    await page.goto(`${BASE_URL}/tickets/${ticket.id}`)
    await addLineToList(page, items[0].id, 'Pantry')

    // Same name as an item of the list: added at once, no review step, and no store needed.
    await expect(page).toHaveURL(/base-lists/, { timeout: 10000 })
  })

  test('links a differently named line to an item and remembers it on the next receipt', async ({ page }) => {
    const setup = await createCompleteSetup({ baseListName: 'Pantry', items: [{ name: '2% Milk 4L', category: 'Dairy' }] })
    const first = await createReadReceipt(setup.user.userId, { storeName: 'Metro', items: [{ name: 'LECHE 2% 4L', price: 5 }] })
    const second = await createReadReceipt(setup.user.userId, { storeName: 'Metro', items: [{ name: 'Leche 2% 4L', price: 6 }] })
    await signIn(page, setup.user.email, setup.user.password)

    await page.goto(`${BASE_URL}/tickets/${first.ticket.id}`)
    await addLineToList(page, first.items[0].id, 'Pantry')

    const review = page.getByTestId('merge-review-step')
    await expect(review.getByTestId('merge-review-new')).toBeVisible()
    await review.getByRole('button', { name: /^Link / }).click()
    const picker = page.getByTestId('link-item-dialog')
    await picker.getByText('2% Milk 4l').click()
    await picker.getByRole('button', { name: 'Link to This Item' }).click()
    await expect(review.getByText('Updates “2% Milk 4l”')).toBeVisible()
    await page.getByTestId('merge-to-base-list-dialog').getByRole('button', { name: 'Add 1 Item' }).click()
    await expect(page).toHaveURL(/base-lists/, { timeout: 10000 })
    await expect(page.getByText(/leche/i)).toHaveCount(0)

    // The next receipt with that line shows the remembered match before adding anything.
    await page.goto(`${BASE_URL}/tickets/${second.ticket.id}`)
    await addLineToList(page, second.items[0].id, 'Pantry')
    await expect(page.getByTestId('merge-review-remembered')).toBeVisible()
    await expect(page.getByText(/remembered from an earlier receipt/)).toBeVisible()
  })
})
