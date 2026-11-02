/**
 * Creates the account the UI specs sign in with, on a LOCAL Supabase only.
 * Run with: node --env-file=.env.test.local e2e/create-test-user.mjs
 *
 * It reads only the E2E_SUPABASE_* inputs and refuses anything that is not a loopback address with an explicit port. The
 * application's own credentials (.env.local, which may point at the hosted project) are never read.
 */

import { createClient } from '@supabase/supabase-js'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

function fail(message) {
  console.error(`❌ ${message}`)
  process.exit(1)
}

const supabaseUrl = process.env.E2E_SUPABASE_URL
const supabaseServiceKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  fail('Set E2E_SUPABASE_URL and E2E_SUPABASE_SERVICE_ROLE_KEY (for example with --env-file=.env.test.local).')
}

let target
try {
  target = new URL(supabaseUrl)
} catch {
  fail('E2E_SUPABASE_URL is not a valid URL.')
}
if (!LOOPBACK_HOSTS.has(target.hostname) || !target.port || target.username || target.password) {
  fail('E2E_SUPABASE_URL must be a loopback address (localhost, 127.0.0.1 or [::1]) with an explicit port and no credentials.')
}

const supabase = createClient(target.origin, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  const testEmail = process.env.E2E_USER_EMAIL || `e2e-${crypto.randomUUID()}@example.test`
  const testPassword = process.env.E2E_USER_PASSWORD || `Local-${crypto.randomUUID()}-Only!`

  console.log('👤 Creating a local test user...')

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  })

  if (error) {
    fail(`Failed to create the test user: ${error.message}`)
  }

  console.log('✅ Test user created on the local Supabase.')
  console.log(`   Email: ${testEmail}`)
  console.log(`   User ID: ${data.user?.id}`)
  if (!process.env.E2E_USER_PASSWORD) {
    console.log('   Password: generated; set E2E_USER_EMAIL and E2E_USER_PASSWORD to choose your own.')
  }
}

createTestUser()
