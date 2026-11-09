/* eslint-disable @typescript-eslint/no-explicit-any -- legacy client: callers rely on the loose default payload type */
import type { ApiError, ApiSuccess } from '@/lib/api/http'
import { markLocalMutation } from '@/utils/local-activity'

export type LegacyResult<T = any> = {
  data?: T
  error?: string
  meta?: Record<string, unknown>
  errorCode?: string
  details?: unknown
  status?: number
  [key: string]: any
}

async function getBaseUrl(): Promise<string> {
  if (typeof window !== 'undefined') return ''

  // On server-side we should prefer the incoming request host to preserve
  // same-origin cookies/session in multi-domain production setups.
  const { headers } = await import('next/headers')
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || 'http'

  if (host) return `${proto}://${host}`

  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit

  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`

  return ''
}

async function request<T = any>(path: string, init?: RequestInit): Promise<LegacyResult<T>> {
  // The realtime echo of this change must not be announced to the person who made it.
  if (typeof window !== 'undefined' && init?.method && init.method !== 'GET') markLocalMutation()
  try {
    const baseUrl = await getBaseUrl()
    const headers = new Headers(init?.headers ?? {})

    if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (typeof window === 'undefined' && !headers.has('cookie')) {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const cookieHeader = cookieStore.toString()
      if (cookieHeader) {
        headers.set('cookie', cookieHeader)
      }
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
      credentials: 'include',
    })

    if (res.status === 204) {
      return { data: undefined as T, status: res.status }
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const raw = await res.text()
      const looksLikeHtml = raw.trimStart().startsWith('<!doctype') || raw.trimStart().startsWith('<html')
      const isAuthPage = looksLikeHtml && (raw.includes('/auth/signin') || raw.includes('Sign in') || raw.includes('signin'))

      if (isAuthPage || res.status === 401 || res.status === 403) {
        return { error: 'Unauthorized', errorCode: 'UNAUTHORIZED', status: res.status }
      }

      return {
        error: `Unexpected non-JSON response (status ${res.status})`,
        status: res.status,
        details: { contentType, preview: raw.slice(0, 180) },
      }
    }

    const payload = (await res.json()) as ApiSuccess<T> | ApiError

    if (!res.ok) {
      if ('error' in payload) {
        return {
          error: payload.error.message,
          errorCode: payload.error.code,
          details: payload.error.details,
          status: res.status,
        }
      }

      return { error: 'Request failed', status: res.status }
    }

    if ('data' in payload) {
      return { data: payload.data, meta: payload.meta, status: res.status }
    }

    return { error: 'Malformed success response', status: res.status }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error'
    return { error: message }
  }
}

export async function apiGet<T = any>(path: string, signal?: AbortSignal) {
  return request<T>(path, { method: 'GET', signal })
}

export async function apiPost<T = any>(path: string, body?: unknown | FormData) {
  return request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function apiPatch<T = any>(path: string, body?: unknown, signal?: AbortSignal) {
  return request<T>(path, {
    method: 'PATCH',
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function apiDelete<T = any>(path: string) {
  return request<T>(path, { method: 'DELETE' })
}
