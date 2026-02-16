/**
 * Playwright Global Setup
 *
 * Runs once before all tests
 * Use for: DB migrations check, global fixtures, etc.
 */

import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

export default async function globalSetup() {
  console.log('🚀 Starting E2E test suite...')

  // Verify environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missing = requiredEnvVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please create .env.local with Supabase credentials.\n' +
      'See .env.example for reference.'
    )
  }

  console.log('✅ Environment variables verified')

  // Note: UI tests require a test user to exist
  // Create manually in Supabase with:
  // Email: test@example.com
  // Password: password123

  console.log('✅ Global setup complete')
}
