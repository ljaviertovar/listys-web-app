/**
 * Playwright Global Setup
 *
 * Runs once before all tests. It only validates the environment: the Supabase target and the application origin must both be
 * loopback and come from the `E2E_*` inputs, so a run can never be pointed at the hosted project.
 */

import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

import { loadE2EEnv } from './helpers/e2e-env'

function assertLocalE2EEnvironment() {
  if (process.env.E2E_CONFIG_INVALID === 'true') {
    throw new Error('Missing .env.test.local. E2E is blocked to prevent execution against non-test environments.')
  }

  const envPath = path.resolve(process.cwd(), '.env.test.local')

  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.test.local. E2E is blocked to prevent execution against non-test environments.')
  }

  config({ path: envPath, override: true })

  // Throws, naming the field and never a value, unless every input is present and loopback.
  loadE2EEnv()
}

export default async function globalSetup() {
  console.log('🚀 Starting E2E test suite...')

  assertLocalE2EEnvironment()

  console.log('✅ E2E environment is local')

  // Note: UI tests need an account on that local Supabase. Create one with `node e2e/create-test-user.mjs`.

  console.log('✅ Global setup complete')
}
