import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'
import type { createClient } from '@/lib/supabase/server'
import type { CompleteShoppingSessionInput } from '@/lib/validations/shopping-session'

/** What completing a session did to the base list. `over_limit_count` is the part of `skipped_count` that did not fit. */
export type SessionSyncSummary = {
  new_count: number
  updated_count: number
  skipped_count: number
  over_limit_count: number
}

export const COMPLETE_SESSION_FAILED_MESSAGE = 'Could not complete the shopping session. Please try again.'

/**
 * Completes a session and applies its checked items to the base list in one database transaction.
 * Shared by the REST service and the Server Action so both map failures the same way and neither can skip the sync.
 * Database messages never leave the server: unknown failures are logged by code only and returned as a generic message.
 */
export async function completeSessionViaRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  input: CompleteShoppingSessionInput,
): Promise<SessionSyncSummary> {
  const { data, error } = await supabase.rpc('complete_shopping_session', {
    p_session_id: sessionId,
    p_total_amount: input.total_amount,
    p_general_notes: input.general_notes,
    p_max_items: MAX_ITEMS_PER_BASE_LIST,
  })

  if (error) {
    if (error.message === 'SESSION_NOT_FOUND') {
      throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Shopping session not found')
    }
    if (error.message === 'SESSION_NOT_ACTIVE') {
      throw new ApiServiceError(409, ErrorCode.CONFLICT, 'This shopping session is already completed.')
    }
    console.error('[complete-session] completion failed', { code: error.code })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, COMPLETE_SESSION_FAILED_MESSAGE)
  }

  const row = Array.isArray(data) ? data[0] : data
  return {
    new_count: row?.new_count ?? 0,
    updated_count: row?.updated_count ?? 0,
    skipped_count: row?.skipped_count ?? 0,
    over_limit_count: row?.over_limit_count ?? 0,
  }
}
