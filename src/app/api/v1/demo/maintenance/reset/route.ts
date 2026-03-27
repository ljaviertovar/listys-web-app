import { ApiServiceError, failure, success, ErrorCode } from '@/lib/api/http'
import { resetDemoUserData } from '@/lib/demo/admin'
import { assertDemoResetConfigured, getDemoResetSecret, isDemoModeEnabled } from '@/lib/demo/config'
import { assertRateLimit, getRequestIp } from '@/lib/demo/rate-limit'

function extractSecret(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  return request.headers.get('x-demo-reset-secret')?.trim() || ''
}

export async function POST(request: Request) {
  if (!isDemoModeEnabled()) {
    return failure(404, ErrorCode.NOT_FOUND, 'Public demo access is not enabled.')
  }

  try {
    assertDemoResetConfigured()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Demo reset is not configured.'
    return failure(500, ErrorCode.INTERNAL_ERROR, message)
  }

  const providedSecret = extractSecret(request)
  if (!providedSecret || providedSecret !== getDemoResetSecret()) {
    return failure(403, ErrorCode.FORBIDDEN, 'Invalid demo reset secret.')
  }

  const ip = getRequestIp(request)

  try {
    assertRateLimit(`demo-reset:${ip}`, {
      max: 5,
      windowMs: 60_000,
      message: 'Too many demo reset attempts. Please wait a moment and try again.',
    })
  } catch (error) {
    if (error instanceof ApiServiceError) {
      return failure(error.status, error.code, error.message, { details: error.details })
    }
    return failure(429, ErrorCode.TOO_MANY_REQUESTS, 'Too many demo reset attempts. Please wait and try again.')
  }

  try {
    const data = await resetDemoUserData()
    console.info('[demo] Demo dataset reset completed.', { ip, userId: data.userId })
    return success(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset demo data.'
    return failure(500, ErrorCode.INTERNAL_ERROR, message)
  }
}
