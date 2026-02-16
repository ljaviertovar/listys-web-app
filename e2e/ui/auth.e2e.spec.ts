import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('should complete full registration flow', async ({ page }) => {
    // Navigate to sign up
    await page.click('a[href*="/auth/signup"]')
    await expect(page).toHaveURL(/\/auth\/signup/)

    // Fill registration form
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show confirmation message
    await expect(page).toHaveURL(/\/(dashboard|auth\/confirm)/, { timeout: 10000 })
  })

  test('should sign in with valid credentials', async ({ page }) => {
    // Use existing test user credentials
    await page.click('a[href*="/auth/signin"]')
    await expect(page).toHaveURL(/\/auth\/signin/)

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Verify user is logged in (check for logout button or user menu)
    await expect(page.locator('button:has-text("Sign out"), a:has-text("Sign out")')).toBeVisible()
  })

  test('should persist session across page reloads', async ({ page }) => {
    // Sign in first
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Reload page
    await page.reload()

    // Should still be authenticated
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('button:has-text("Sign out"), a:has-text("Sign out")')).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.click('a[href*="/auth/signin"]')

    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid credentials, text=Invalid login credentials, [role="alert"]')).toBeVisible({ timeout: 5000 })

    // Should stay on signin page
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should sign out successfully', async ({ page }) => {
    // Sign in first
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Sign out
    await page.click('button:has-text("Sign out"), a:has-text("Sign out")')

    // Should redirect to home or signin
    await expect(page).toHaveURL(/\/(auth\/signin|$)/, { timeout: 5000 })

    // Trying to access protected route should redirect
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should validate email format', async ({ page }) => {
    await page.click('a[href*="/auth/signup"]')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')

    // Try to submit
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=Invalid email, text=Please enter a valid email')).toBeVisible()
  })

  test('should enforce password requirements', async ({ page }) => {
    await page.click('a[href*="/auth/signup"]')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'weak')
    await page.fill('input[name="confirmPassword"]', 'weak')

    // Try to submit
    await page.click('button[type="submit"]')

    // Should show password validation error
    await expect(page.locator('text=/password.*must.*characters/i, text=/password.*too.*short/i')).toBeVisible()
  })
})
