/**
 * Script to create a test user for E2E UI tests
 * Run with: node e2e/create-test-user.mjs
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  const testEmail = 'test@example.com'
  const testPassword = 'password123'

  console.log('🔍 Checking if test user exists...')

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const userExists = existingUsers?.users?.some(u => u.email === testEmail)

  if (userExists) {
    console.log(`✅ Test user already exists: ${testEmail}`)
    return
  }

  // Create new test user
  console.log(`👤 Creating test user: ${testEmail}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  })

  if (error) {
    console.error('❌ Failed to create test user:', error.message)
    process.exit(1)
  }

  console.log(`✅ Test user created successfully!`)
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
  console.log(`   User ID: ${data.user?.id}`)
}

createTestUser()
