import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/features/database.types'

/**
 * Supabase client for E2E tests
 * Uses service role key to bypass RLS for test setup/teardown
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Supabase client with user authentication for testing RLS
 */
export function createAuthenticatedClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
    )
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // Set the session with the provided access token
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: 'dummy-refresh-token',
  })

  return client
}
