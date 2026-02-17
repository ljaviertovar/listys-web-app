/**
 * Playwright Global Setup
 *
 * Runs once before all tests
 * Use for: DB migrations check, global fixtures, etc.
 */

import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

function extractProjectRef(url: string) {
  const match = url.match(/^https?:\/\/([^.]+)\./)
  return match?.[1]
}

function assertDedicatedE2EEnvironment() {
  if (process.env.E2E_CONFIG_INVALID === 'true') {
    throw new Error(
      'Missing .env.test.local. E2E is blocked to prevent execution against non-test environments.'
    )
  }

  const envPath = path.resolve(process.cwd(), '.env.test.local')

  if (!fs.existsSync(envPath)) {
    throw new Error(
      'Missing .env.test.local. E2E is blocked to prevent execution against non-test environments.'
    )
  }

  config({ path: envPath, override: true })

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'E2E_TEST_PROJECT_REF',
    'E2E_ALLOW_DB_RESET',
  ]

  const missing = requiredEnvVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required E2E environment variables: ${missing.join(', ')}\n` +
      'Use .env.test.local with dedicated test project credentials only.'
    )
  }

  const currentProjectRef = extractProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL as string)
  const expectedProjectRef = process.env.E2E_TEST_PROJECT_REF

  if (!currentProjectRef || currentProjectRef !== expectedProjectRef) {
    throw new Error(
      `E2E blocked. Project ref mismatch: current=${currentProjectRef ?? 'unknown'} expected=${expectedProjectRef}.`
    )
  }

  if (process.env.E2E_ALLOW_DB_RESET !== 'true') {
    throw new Error('E2E blocked. Set E2E_ALLOW_DB_RESET=true only for dedicated test environments.')
  }
}

export default async function globalSetup() {
  console.log('🚀 Starting E2E test suite...')

  assertDedicatedE2EEnvironment()

  console.log('✅ Environment variables verified')

  // Note: UI tests require a test user to exist
  // Create manually in Supabase with:
  // Email: test@example.com
  // Password: password123

  console.log('✅ Global setup complete')
}
