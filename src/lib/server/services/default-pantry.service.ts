import { z } from 'zod'

import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { DEFAULT_PANTRY_GROUP_NAME, DEFAULT_PANTRY_LIST_NAME } from '@/lib/config/default-pantry'

/** What setting up the Pantry did: nothing (already default), marked a list the account had, or created a new one. */
export type DefaultPantryOutcome = 'existing' | 'adopted' | 'created'

const setUpDefaultPantryResultSchema = z.object({
  list_id: z.string().uuid(),
  outcome: z.enum(['existing', 'adopted', 'created']),
})

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

/**
 * Gives the signed-in account a default list on request: the one it already has, an existing "Pantry" marked as the
 * default, or a new empty "Pantry". Unlike `ensureDefaultPantry` it is meant for accounts that already have lists and
 * it reports failures, because the user asked for it and needs to know whether it worked.
 */
export async function setUpDefaultPantry(): Promise<{ id: string; outcome: DefaultPantryOutcome }> {
  const { supabase } = await createAuthenticatedClient()
  const { data, error } = await supabase.rpc('create_default_pantry', {
    p_group_name: DEFAULT_PANTRY_GROUP_NAME,
    p_list_name: DEFAULT_PANTRY_LIST_NAME,
  })

  const result = error ? null : setUpDefaultPantryResultSchema.safeParse(data)

  if (error || !result?.success) {
    // Only the code is logged: the message can carry names or row data.
    console.error('[default-pantry] setup failed', { code: error?.code ?? 'invalid-response' })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t set up your Pantry. Try again.')
  }

  return { id: result.data.list_id, outcome: result.data.outcome }
}
