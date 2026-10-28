import { createAuthenticatedClient } from '@/lib/api/auth'
import { DEFAULT_PANTRY_GROUP_NAME, DEFAULT_PANTRY_LIST_NAME } from '@/lib/config/default-pantry'

/**
 * Makes sure a user who owns no list has the default "Pantry" list. The database function is idempotent and race-safe,
 * and leaves accounts that already have lists untouched, so it is safe to call on every dashboard visit.
 *
 * It never throws: provisioning is a convenience and must not stop the dashboard from loading. A failure is logged by
 * code only (no user data, no database message) and is retried on the next visit.
 *
 * @returns whether this call created the list
 */
export async function ensureDefaultPantry(): Promise<boolean> {
  try {
    const { supabase } = await createAuthenticatedClient()
    const { data, error } = await supabase.rpc('ensure_default_pantry', {
      p_group_name: DEFAULT_PANTRY_GROUP_NAME,
      p_list_name: DEFAULT_PANTRY_LIST_NAME,
    })

    if (error) {
      console.error('[default-pantry] provisioning failed', { code: error.code })
      return false
    }

    return data === true
  } catch {
    console.error('[default-pantry] provisioning failed', { code: 'unexpected' })
    return false
  }
}
