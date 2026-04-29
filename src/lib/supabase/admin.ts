import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Service-role Supabase client — bypasses RLS.
 * Use only for server-side operations that legitimately need to act outside
 * the current user's RLS scope (e.g., invite acceptance flows that must
 * read/write rows before the user has been granted access via RLS).
 *
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
