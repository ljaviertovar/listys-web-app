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

/**
 * Turns an error from the stores and matching database functions into the API error the client sees:
 * P0002 → 404, 22023/22P02 → 422, 23505 → 409 CONFLICT (with the id of the store that has the name), a store or list
 * limit → 409 LIMIT_EXCEEDED, anything else → a generic 500 with only the code logged.
 */
export function mapRpcError(error: RpcError, context: string): ApiServiceError {
  const code = error.code ?? ''
  const message = error.message ?? ''

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
