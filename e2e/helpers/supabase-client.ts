import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

import { loadE2EEnv } from './e2e-env'

/**
 * Supabase client for E2E tests
 * Uses the service role key to bypass RLS for test setup/teardown. The target comes from the `E2E_SUPABASE_*` inputs and
 * must be a loopback address; the application's own credentials are never read.
 */
export function createTestClient() {
  const { supabaseUrl, serviceRoleKey } = loadE2EEnv()

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
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
  const { supabaseUrl, publishableKey } = loadE2EEnv()

  const client = createClient<Database>(supabaseUrl, publishableKey)

  // Set the session with the provided access token
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: 'dummy-refresh-token',
  })

  return client
}
