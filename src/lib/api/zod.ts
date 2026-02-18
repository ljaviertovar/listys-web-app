import { z } from 'zod'

import { ApiServiceError, ErrorCode } from '@/lib/api/http'

export function parseWithSchema<T>(schema: z.ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message ?? 'Invalid payload', {
      issues: parsed.error.issues,
    })
  }

  return parsed.data
}

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    throw new ApiServiceError(400, ErrorCode.BAD_REQUEST, 'Invalid JSON body')
  }

  return parseWithSchema(schema, body)
}

export async function parseRouteParams<T>(params: Promise<unknown> | unknown, schema: z.ZodType<T>): Promise<T> {
  const resolved = params && typeof (params as Promise<unknown>).then === 'function' ? await (params as Promise<unknown>) : params
  return parseWithSchema(schema, resolved)
}

export function parseSearchParams<T>(request: Request, schema: z.ZodType<T>): T {
  const search = Object.fromEntries(new URL(request.url).searchParams.entries())
  return parseWithSchema(schema, search)
}
