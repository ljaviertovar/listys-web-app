import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { MAX_STORES_PER_USER } from '@/lib/config/limits'

type RpcError = { code?: string | null; message?: string | null; details?: string | null }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Messages raised by our own database functions (migration 20261025000000). Only these reach the client; any other
// database text stays in the server log, because it can describe tables, policies or values.
const NOT_FOUND_MESSAGES = new Set(['Store not found', 'Ticket not found', 'Base list not found'])
const VALIDATION_MESSAGES = new Set([
  'Invalid store name',
  'Cannot merge a store into itself',
  'Invalid links',
  'Each link needs a distinct receipt line',
  'A linked line is not one of the selected receipt lines',
  'A linked item is not in this list',
  'A line with the name of an item in this list cannot be linked to another item',
])

const TICKET_SESSION_CONFLICTS = new Set([
  'RECEIPT_NOT_READ',
  'RECEIPT_ATTACHED',
  'RECEIPT_ADDED_TO_LIST',
  'SESSION_HAS_RECEIPT',
  'SESSION_OUT_OF_WINDOW',
  'STORE_MISMATCH',
])

/**
 * Turns an error from the stores and matching database functions into the API error the client sees:
 * P0002 → 404, 22023/22P02 → 422, 23505 → 409 CONFLICT (with the id of the store that has the name), a store or list
 * limit → 409 LIMIT_EXCEEDED, anything else → a generic 500 with only the code logged.
 */
export function mapRpcError(error: RpcError, context: string): ApiServiceError {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (message === 'RECEIPT_ATTACHED') {
    return new ApiServiceError(409, ErrorCode.CONFLICT, 'This receipt is already attached to a trip.', {
      reason: 'RECEIPT_ATTACHED',
    })
  }

  if (code === 'P0002') {
    return new ApiServiceError(404, ErrorCode.NOT_FOUND, NOT_FOUND_MESSAGES.has(message) ? message : 'Not found')
  }

  if (code === '22023') {
    return new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, VALIDATION_MESSAGES.has(message) ? message : 'Invalid request')
  }

  if (code === '22P02') {
    return new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'Invalid identifier')
  }

  if (code === '23505') {
    const storeId = error.details && UUID_PATTERN.test(error.details) ? error.details : undefined
    return new ApiServiceError(
      409,
      ErrorCode.CONFLICT,
      'Another store already uses this name.',
      storeId ? { store_id: storeId } : undefined,
    )
  }

  if (message.startsWith('Store limit reached')) {
    return new ApiServiceError(
      409,
      ErrorCode.LIMIT_EXCEEDED,
      `You can have up to ${MAX_STORES_PER_USER} stores. Merge stores to make room.`,
    )
  }

  // Raised by merge_ticket_items_to_base_list with numbers only, so the text is safe to show.
  if (message.startsWith('Cannot merge items.')) {
    return new ApiServiceError(409, ErrorCode.LIMIT_EXCEEDED, message)
  }

  console.error(`[${context}] database function failed`, { code: code || 'unknown' })
  return new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')
}

export function mapStartShoppingSessionRpcError(error: RpcError): ApiServiceError {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (code === 'P0002') {
    return new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Not found')
  }

  if (code === 'P0001' && message === 'LIST_EMPTY') {
    return new ApiServiceError(409, ErrorCode.CONFLICT, 'Cannot start a shopping session from an empty list.')
  }

  if (code === '23505' && message === 'SESSION_ALREADY_ACTIVE') {
    const activeSessionId = error.details && UUID_PATTERN.test(error.details) ? error.details : undefined
    return new ApiServiceError(
      409,
      ErrorCode.CONFLICT,
      'This list already has a shopping session in progress.',
      activeSessionId ? { activeSessionId } : undefined,
    )
  }

  console.error('[startShoppingSession] database function failed', { code: code || 'unknown' })
  return new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')
}

export function mapTicketSessionAttachRpcError(error: RpcError): ApiServiceError {
  const code = error.code ?? ''
  const reason = code === '23505' ? error.details ?? '' : error.message ?? ''

  if (code === 'P0002') return new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Not found')
  if (code === '22023') return new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'Invalid request')

  if ((code === 'P0001' || code === '23505') && TICKET_SESSION_CONFLICTS.has(reason)) {
    const shoppingSessionId = error.details && UUID_PATTERN.test(error.details) ? error.details : undefined
    return new ApiServiceError(409, ErrorCode.CONFLICT, 'This receipt cannot be attached to that trip.', {
      reason,
      ...(shoppingSessionId ? { shopping_session_id: shoppingSessionId } : {}),
    })
  }

  console.error('[attachTicketToSession] database function failed', { code: code || 'unknown' })
  return new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Something went wrong. Please try again.')
}
