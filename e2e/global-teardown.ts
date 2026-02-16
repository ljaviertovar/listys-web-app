/**
 * Playwright Global Teardown
 *
 * Runs once after all tests complete
 * Use for: Final cleanup, closing connections, etc.
 */

import { config } from 'dotenv'
import path from 'path'
import { fullReset } from './helpers'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

export default async function globalTeardown() {
  console.log('🧹 Running global teardown...')

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
