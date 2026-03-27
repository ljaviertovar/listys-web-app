import { NextResponse } from 'next/server'

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export type ApiSuccess<T> = {
  data: T
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
}

export type ApiError = {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
    request_id?: string
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

export class ApiServiceError extends Error {
  status: number
  code: ErrorCode
  details?: unknown

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function success<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) } satisfies ApiSuccess<T>, { status })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function failure(
  status: number,
  code: ErrorCode,
  message: string,
  options?: { details?: unknown; requestId?: string }
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(options?.details !== undefined ? { details: options.details } : {}),
        ...(options?.requestId ? { request_id: options.requestId } : {}),
      },
    } satisfies ApiError,
    { status }
  )
}

export function fromUnknownError(error: unknown, requestId: string) {
  if (error instanceof ApiServiceError) {
    return failure(error.status, error.code, error.message, {
      details: error.details,
      requestId,
    })
  }

  const message = error instanceof Error ? error.message : 'Internal error'
  return failure(500, ErrorCode.INTERNAL_ERROR, message, { requestId })
}

export async function withApiHandler<T>(handler: (ctx: { requestId: string }) => Promise<NextResponse<T> | Response>) {
  const requestId = crypto.randomUUID()

  try {
    return await handler({ requestId })
  } catch (error) {
    return fromUnknownError(error, requestId)
  }
}
