/**
 * Playwright Global Teardown
 *
 * Runs once after all tests complete
 * Use for: Final cleanup, closing connections, etc.
 */

import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fullReset } from './helpers'

function extractProjectRef(url: string) {
  const match = url.match(/^https?:\/\/([^.]+)\./)
  return match?.[1]
}

function assertDedicatedE2EEnvironment() {
  if (process.env.E2E_CONFIG_INVALID === 'true') {
    throw new Error('Missing .env.test.local. Teardown blocked to protect non-test environments.')
  }

  const envPath = path.resolve(process.cwd(), '.env.test.local')

  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.test.local. Teardown blocked to protect non-test environments.')
  }

  config({ path: envPath, override: true })

  if (process.env.E2E_ALLOW_DB_RESET !== 'true') {
    throw new Error('Teardown blocked. E2E_ALLOW_DB_RESET must be true in dedicated test env.')
  }

  const currentProjectRef = extractProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL as string)
  const expectedProjectRef = process.env.E2E_TEST_PROJECT_REF

  if (!currentProjectRef || !expectedProjectRef || currentProjectRef !== expectedProjectRef) {
    throw new Error(
      `Teardown blocked by project ref mismatch: current=${currentProjectRef ?? 'unknown'} expected=${expectedProjectRef ?? 'missing'}.`
    )
  }
}

export default async function globalTeardown() {
  console.log('🧹 Running global teardown...')
  assertDedicatedE2EEnvironment()

  try {
    // Clean up all test data
    await fullReset()
    console.log('✅ Test data cleaned')
  } catch (error) {
    console.error('❌ Teardown failed:', error)
    // Don't throw - let tests complete even if cleanup fails
  }

  console.log('✅ Global teardown complete')
}
