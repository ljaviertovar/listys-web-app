import { expect, test } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Landing Shared Lists Showcase', () => {
	test('renders shared lists showcase section on home', async ({ page }) => {
		await page.goto(BASE_URL)

		await expect(page.getByTestId('shared-lists-showcase')).toBeVisible()
		await expect(page.getByTestId('shared-lists-showcase-headline')).toHaveText(
			'Shop better together with shared lists',
		)

		await expect(page.getByTestId('shared-lists-showcase-card-top')).toBeVisible()
		await expect(page.getByTestId('shared-lists-showcase-card-bottom')).toBeVisible()

		await expect(page.getByText('apples', { exact: true }).first()).toBeVisible()
		await expect(page.getByText('watermelon', { exact: true })).toBeVisible()

		const bridgeAvatars = page.getByTestId('shared-lists-showcase-avatars').locator('[data-slot="avatar"]')
		await expect(bridgeAvatars).toHaveCount(2)
	})

	test('keeps showcase content visible on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(BASE_URL)

		await expect(page.getByTestId('shared-lists-showcase-headline')).toBeVisible()
		await expect(page.getByTestId('shared-lists-showcase-card-top')).toBeVisible()
		await expect(page.getByTestId('shared-lists-showcase-card-bottom')).toBeVisible()
	})
})
