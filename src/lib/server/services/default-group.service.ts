import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { DEFAULT_PANTRY_GROUP_NAME } from '@/lib/config/default-pantry'
import type { createClient } from '@/lib/supabase/server'

type ServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * The group a new list goes into. Lists no longer ask for a group, so without `groupId` the list goes to the user's
 * implicit default group, created here the first time it is needed (also for accounts that already had lists).
 *
 * A `groupId` from an API client must be the user's own. A group that is somebody else's and one that does not exist
 * get the same answer, so the response never says which groups exist.
 */
export async function resolveListGroupId(supabase: ServerClient, userId: string, groupId?: string | null) {
  if (groupId) {
    const { data: group } = await supabase.from('groups').select('id').eq('id', groupId).eq('user_id', userId).maybeSingle()

    if (!group) {
      throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Group not found')
    }

    return group.id
  }

  const { data, error } = await supabase.rpc('ensure_default_group', { p_group_name: DEFAULT_PANTRY_GROUP_NAME })

  if (error || !data) {
    // Only the code is logged: the message can carry names or row data.
    console.error('[default-group] could not resolve the default group', { code: error?.code ?? 'empty' })
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t create your list. Try again.')
  }

  return data
}
