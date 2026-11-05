import { test, expect, type Page } from '@playwright/test'

import { createCloseTheLoopFixture } from '../helpers'

const BASE_URL = process.env.E2E_APP_URL ?? 'http://localhost:3000'
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(new URL(BASE_URL).hostname)) {
  throw new Error('Receipt reconciliation E2E specs may only run against a local app URL.')
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/auth/signin`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Receipt to trip reconciliation (PRD v3 Phase 5)', () => {
  test('attaches to an active trip, completes it with receipt prices, and hides list actions', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture()
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/tickets/${fixture.ticketId}`)

      const card = page.getByTestId('ticket-attach-card')
      await expect(card).toBeVisible()
      await card.getByRole('button', { name: 'Review Weekend trip' }).click()

      const dialog = page.getByTestId('attach-to-session-dialog')
      await expect(dialog.getByTestId('attach-session-review')).toBeVisible()
      await expect(dialog.getByTestId('attach-review-section-will-be-checked')).toContainText('Milk')
      await expect(dialog.getByTestId('attach-review-section-new')).toContainText('Apples')
      await expect(dialog.getByLabel('Total paid')).toHaveValue('17.25')
      await dialog.getByRole('button', { name: 'Attach and Complete Trip' }).click()

      await expect(page).toHaveURL(new RegExp(`/shopping/${fixture.sessionId}$`))
      await expect(page.getByText(/\$17\.25/)).toBeVisible()
      await expect(page.getByText('Apples')).toBeVisible()
      await expect(page.getByText('Unmentioned item')).toBeVisible()
      await expect(page.getByText(/\$4\.25/)).toBeVisible()

      await page.goto(`${BASE_URL}/tickets/${fixture.ticketId}`)
      await expect(page.getByTestId('ticket-attached-state')).toContainText('Weekend trip')
      await expect(page.getByRole('button', { name: 'Add or Update' })).toHaveCount(0)
    } finally {
      await fixture.cleanup()
    }
  })

  test('attaches to a recently completed trip without counting its matched item twice', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture({ sessionStatus: 'completed', sessionStore: 'North Market' })
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/tickets/${fixture.ticketId}`)
      const card = page.getByTestId('ticket-attach-card')
      await card.getByRole('button', { name: 'Review Weekend trip' }).click()

      const dialog = page.getByTestId('attach-to-session-dialog')
      await expect(dialog.getByRole('button', { name: 'Attach to Trip' })).toBeVisible()
      await dialog.getByRole('button', { name: 'Change Apples', exact: true }).click()
      const change = page.getByTestId('change-line-sheet')
      await change.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expect(dialog.getByTestId('attach-review-section-new')).toContainText('Apples')

      await dialog.getByRole('button', { name: 'Change Apples', exact: true }).click()
      const reopenedChange = page.getByTestId('change-line-sheet')
      await reopenedChange.getByTestId('change-line-choice-leave').click()
      await reopenedChange.getByRole('button', { name: 'Save', exact: true }).click()
      await expect(dialog.getByTestId('attach-review-stat-new')).toContainText('0')
      await expect(dialog.getByTestId('attach-review-stat-left-out')).toContainText('1')
      await dialog.getByRole('button', { name: 'Attach to Trip' }).click()

      await expect(page).toHaveURL(new RegExp(`/shopping/${fixture.sessionId}$`))
      const state = await fixture.getItemState()
      expect(state?.purchase_count).toBe(3)
      expect(state?.average_price).toBeCloseTo(8.08, 2)
      const apples = await fixture.getItemState('apples')
      expect(apples).toBeNull()
    } finally {
      await fixture.cleanup()
    }
  })

  test('attaches a receipt to an active trip without completing shopping', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture()
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/tickets/${fixture.ticketId}`)
      await page.getByTestId('ticket-attach-card').getByRole('button', { name: 'Review Weekend trip' }).click()

      const dialog = page.getByTestId('attach-to-session-dialog')
      await expect(dialog.getByTestId('attach-review-still-shopping')).toContainText('The trip is still shopping')
      await dialog.getByRole('button', { name: 'Attach Receipt', exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`/shopping/${fixture.sessionId}$`))
      await expect(page.getByTestId('session-receipt-summary')).toContainText('Attached to trip')
      expect(await fixture.getSessionStatus()).toBe('active')
    } finally {
      await fixture.cleanup()
    }
  })

  test('retries a failed attachment with the same payload', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture()
    let attempts = 0
    let firstPayload: unknown
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/shopping/${fixture.sessionId}`)
      await page.getByRole('button', { name: 'Review Receipt', exact: true }).click()

      await page.route(`**/api/v1/tickets/${fixture.ticketId}/attach-to-session`, async route => {
        attempts += 1
        const payload = route.request().postDataJSON()
        if (attempts === 1) {
          firstPayload = payload
          await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Temporary failure', details: null } }) })
          return
        }
        expect(payload).toEqual(firstPayload)
        await route.continue()
      })

      const dialog = page.getByTestId('attach-to-session-dialog')
      await dialog.getByRole('button', { name: 'Attach Receipt', exact: true }).click()
      await expect(dialog.getByTestId('attach-review-submit-error')).toBeVisible()
      await dialog.getByRole('button', { name: 'Try Again', exact: true }).click()

      await expect(dialog).toHaveCount(0)
      await expect(page.getByTestId('session-receipt-summary')).toContainText('Attached to trip')
      expect(attempts).toBe(2)
      expect(firstPayload).toMatchObject({ shopping_session_id: fixture.sessionId, complete_session: false })
      expect(await fixture.getSessionStatus()).toBe('active')
    } finally {
      await fixture.cleanup()
    }
  })

  test('Attach Later closes a failed review without another request', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture()
    let attempts = 0
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/shopping/${fixture.sessionId}`)
      await page.getByRole('button', { name: 'Review Receipt', exact: true }).click()
      await page.route(`**/api/v1/tickets/${fixture.ticketId}/attach-to-session`, async route => {
        attempts += 1
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Temporary failure', details: null } }) })
      })

      const dialog = page.getByTestId('attach-to-session-dialog')
      await dialog.getByRole('button', { name: 'Attach Receipt', exact: true }).click()
      await expect(dialog.getByTestId('attach-review-submit-error')).toBeVisible()
      await dialog.getByRole('button', { name: 'Attach Later', exact: true }).click()

      await expect(dialog).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Review Receipt', exact: true })).toBeVisible()
      expect(attempts).toBe(1)
      expect(await fixture.getSessionStatus()).toBe('active')
    } finally {
      await fixture.cleanup()
    }
  })

  test('offers no trip for a receipt uploaded on its own, even with a recent active trip', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture({ uploadedFromTrip: false })
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/tickets/${fixture.ticketId}`)

      await expect(page.getByTestId('ticket-review')).toBeVisible()
      await expect(page.getByTestId('ticket-attach-card')).toHaveCount(0)
      await expect(page.getByTestId('receipt-added-to-list-note')).toHaveCount(0)
    } finally {
      await fixture.cleanup()
    }
  })

  test('cancels a pending receipt review without attaching it', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture({ sessionStatus: 'completed' })
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/shopping/${fixture.sessionId}`)
      await page.getByRole('button', { name: 'Review Receipt', exact: true }).click()
      const dialog = page.getByTestId('attach-to-session-dialog')
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Review Receipt', exact: true })).toBeVisible()
    } finally {
      await fixture.cleanup()
    }
  })

  test('allows another store and refuses a second confirmed receipt at the same store', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture({ sessionStore: 'North Market', receiptStore: 'North Market', withStorePrices: true })
    try {
      await signIn(page, fixture.email, fixture.password)
      const attach = async (ticketId: string) => page.request.post(`${BASE_URL}/api/v1/tickets/${ticketId}/attach-to-session`, {
        data: { shopping_session_id: fixture.sessionId, total_amount: 17.25, complete_session: false, links: [], added_item_ids: [] },
      })
      expect((await attach(fixture.ticketId)).ok()).toBeTruthy()
      const other = await fixture.createReceipt(fixture.storeIds[1])
      expect((await attach(other)).ok()).toBeTruthy()
      const duplicate = await fixture.createReceipt(fixture.storeIds[0])
      expect((await attach(duplicate)).status()).toBe(409)
      await page.goto(`${BASE_URL}/shopping/${fixture.sessionId}`)
      await expect(page.getByTestId('session-receipt-summary')).toContainText('2 receipts')
    } finally {
      await fixture.cleanup()
    }
  })

  test('shows the lowest comparable last receipt price in the store sheet', async ({ page }) => {
    const fixture = await createCloseTheLoopFixture({ withStorePrices: true })
    try {
      await signIn(page, fixture.email, fixture.password)
      await page.goto(`${BASE_URL}/base-lists/${fixture.baseListId}/edit`)

      const row = page.getByTestId(`base-list-item-${fixture.itemId}`)
      await row.getByRole('button', { name: /more options/i }).click()
      await page.getByRole('menuitem', { name: 'Prices by Store' }).click()

      const sheet = page.getByTestId(`item-store-prices-${fixture.itemId}-sheet`)
      await expect(sheet).toContainText('Prices by Store')
      await expect(sheet).toContainText('Cheapest')
      await expect(sheet.getByText('South Market')).toBeVisible()
    } finally {
      await fixture.cleanup()
    }
  })
})
