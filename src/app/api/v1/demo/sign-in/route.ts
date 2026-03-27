import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'
import { ApiServiceError, failure, ErrorCode } from '@/lib/api/http'
import { assertDemoSignInConfigured, getDemoUserEmail, getDemoUserPassword, isDemoModeEnabled } from '@/lib/demo/config'
import { assertRateLimit, getRequestIp } from '@/lib/demo/rate-limit'

export async function POST(request: NextRequest) {
  if (!isDemoModeEnabled()) {
    return failure(404, ErrorCode.NOT_FOUND, 'Public demo access is not enabled.')
  }

  try {
    assertDemoSignInConfigured()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Demo sign-in is not configured.'
    return failure(500, ErrorCode.INTERNAL_ERROR, message)
  }

  const ip = getRequestIp(request)

  try {
    assertRateLimit(`demo-sign-in:${ip}`, {
      max: 10,
      windowMs: 15 * 60_000,
      message: 'Too many demo sign-in attempts. Please wait a few minutes and try again.',
    })
  } catch (error) {
    if (error instanceof ApiServiceError) {
      return failure(error.status, error.code, error.message, { details: error.details })
    }
    return failure(429, ErrorCode.TOO_MANY_REQUESTS, 'Too many demo sign-in attempts. Please wait and try again.')
  }

  let response = NextResponse.json({
    data: {
      success: true,
      redirect_to: '/dashboard',
      account_type: 'demo',
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email: getDemoUserEmail(),
    password: getDemoUserPassword(),
  })

  if (error) {
    console.error('[demo] Public demo sign-in failed.', {
      email: getDemoUserEmail(),
      message: error.message,
      code: error.code,
      status: error.status,
    })

    if (/invalid login credentials/i.test(error.message)) {
      return failure(
        500,
        ErrorCode.INTERNAL_ERROR,
        'Demo sign-in failed because the demo user is not ready yet. Run `npm run demo:seed` and try again.'
      )
    }

    return failure(500, ErrorCode.INTERNAL_ERROR, 'Unable to sign in to the public demo right now.')
  }

  response.headers.set('x-demo-account', 'true')
  console.info('[demo] Public demo sign-in succeeded.', { ip, email: getDemoUserEmail() })

  return response
}
