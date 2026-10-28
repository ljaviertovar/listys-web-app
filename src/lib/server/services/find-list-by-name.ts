import type { createClient } from '@/lib/supabase/server'

type ServerClient = Awaited<ReturnType<typeof createClient>>

export const DUPLICATE_LIST_NAME_MESSAGE = 'A list with this name already exists. Please choose a different name.'

/** `ilike` reads `%` and `_` as wildcards; escaping them (and the escape character) makes the match literal. */
export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

/**
 * Another list of the same user with this name, ignoring case, in any group: lists are identified by name across the
 * whole account now that groups are hidden. `limit(1)` matters because accounts made before this rule can already hold
 * two lists with one name, and `maybeSingle` alone would fail on two rows and report no duplicate.
 */
export async function findListByName(supabase: ServerClient, userId: string, name: string, excludeId?: string) {
  let query = supabase.from('base_lists').select('id').eq('user_id', userId).ilike('name', escapeLikePattern(name))

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query.limit(1).maybeSingle()
  return data
}

/** Saving a list under the name it already has (or changing only its case) is not a conflict, even with a legacy twin. */
export function isSameListName(current: string, next: string) {
  return current.toLowerCase() === next.toLowerCase()
}
