import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables from dedicated E2E env file only
const e2eEnvPath = path.resolve(process.cwd(), '.env.test.local')

if (fs.existsSync(e2eEnvPath)) {
  config({ path: e2eEnvPath, override: true })
} else {
  process.env.E2E_CONFIG_INVALID = 'true'
}

// Only read here, never validated: `playwright test --list` must work without a local Supabase. globalSetup validates the
// inputs (loopback only) before any test runs, and the application below is started against them and nothing else.
const appUrl = process.env.E2E_APP_URL || 'http://localhost:3000'
const appPort = (() => {
  try {
    return new URL(appUrl).port || '3000'
  } catch {
    return '3000' // an invalid E2E_APP_URL is reported by globalSetup
  }
})()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  // The harness's own unit tests run with Vitest (`pnpm test:e2e:helpers`), not in a browser.
  testIgnore: ['**/helpers/tests/**'],

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: appUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /*
   * A dedicated application process pointed at the E2E Supabase and nothing else. Values set here win over `.env.local`
   * (Next never overrides the process environment), so the hosted project in `.env.local` cannot be selected; provider
   * secrets are blanked because no test needs them. It never reuses a server that is already running: that one may be
   * attached to the hosted project.
   */
  webServer: {
    command: `pnpm exec next dev --port ${appPort}`,
    url: appUrl,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.E2E_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.E2E_SUPABASE_PUBLISHABLE_KEY ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.E2E_SUPABASE_PUBLISHABLE_KEY ?? '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? '',
      NEXT_PUBLIC_APP_URL: appUrl,
      OPENAI_API_KEY: '',
      DEMO_MODE_ENABLED: 'false',
      NEXT_PUBLIC_DEMO_MODE_ENABLED: 'false',
    },
  },
})
