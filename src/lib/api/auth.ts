import { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { isDemoUser as isDemoAccount } from '@/lib/demo/config'

export async function createAuthenticatedClient(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
  isDemoUser: boolean
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized')
  }

  return { supabase, user, isDemoUser: isDemoAccount(user) }
}

export const isDemoUser = isDemoAccount
