import { test as base, expect } from '@playwright/test'
import { createTestUser } from '../helpers/seed-data'
import type { Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
  userEmail: string
  userId: string
  userPassword: string
}

/**
 * Playwright fixture that provides an authenticated page
 *
 * Usage:
 * test('my authenticated test', async ({ authenticatedPage, userId }) => {
 *   await authenticatedPage.goto('/dashboard')
 *   // user is already logged in
 * })
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Create a test user
    const user = await createTestUser()

    // Navigate to sign in page
    await page.goto('/auth/signin')

    // Fill in credentials and sign in
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="password"]', user.password)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard (or wherever authenticated users land)
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Provide the authenticated page and user info to the test
    await use(page)
  },

  userEmail: async ({ authenticatedPage }, use) => {
    // Extract user email from the authenticated session
    const email = await authenticatedPage.evaluate(() => {
      return localStorage.getItem('user-email') || 'unknown'
    })
    await use(email)
  },

  userId: async ({ authenticatedPage }, use) => {
    // Extract user ID from the authenticated session
    const id = await authenticatedPage.evaluate(() => {
      return localStorage.getItem('user-id') || 'unknown'
    })
    await use(id)
  },

  userPassword: async ({ }, use) => {
    await use('test-password-123')
  },
})

export { expect }
