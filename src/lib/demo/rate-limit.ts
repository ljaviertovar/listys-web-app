import { ApiServiceError, ErrorCode } from '@/lib/api/http'

type Bucket = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  max: number
  windowMs: number
  message: string
  details?: Record<string, unknown>
}

const buckets = new Map<string, Bucket>()

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

export function assertRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return
  }

  if (current.count >= options.max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))

    throw new ApiServiceError(429, ErrorCode.TOO_MANY_REQUESTS, options.message, {
      retry_after_seconds: retryAfterSeconds,
      ...options.details,
    })
  }

  current.count += 1
  buckets.set(key, current)
}
