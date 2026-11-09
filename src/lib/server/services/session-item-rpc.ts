import { z } from 'zod'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseWithSchema } from '@/lib/api/zod'
import { itemIdParamsSchema } from '@/lib/validations/api/common'
import { toSessionItemDto, versionedSessionItemInputSchema } from '@/lib/validations/shopping-session-item'
import type { createClient } from '@/lib/supabase/server'

type Client = Awaited<ReturnType<typeof createClient>>

export function throwSessionItemRpcError(error: { message: string; code?: string }): never {
  if (error.message === 'UNAUTHORIZED') throw new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Sign in to save your changes.')
  if (error.message === 'ITEM_NOT_FOUND') throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'This trip or item is no longer available.')
  if (error.message === 'SESSION_NOT_ACTIVE') throw new ApiServiceError(409, ErrorCode.SESSION_NOT_ACTIVE, 'This trip has ended. Your pending changes were not applied.')
  if (error.message === 'INVALID_ITEM_FIELDS') throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, 'Check the item fields and try again.')
  console.error('[session-item] save failed', { code: error.code })
  throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Could not save this item. Please try again.')
}

export async function updateSessionItemViaRpc(supabase: Client, id: string, data: unknown) {
  parseWithSchema(itemIdParamsSchema, { itemId: id })
  if (!data || typeof data !== 'object' || !('expected_version' in data)) {
    throw new ApiServiceError(410, ErrorCode.CLIENT_UPDATE_REQUIRED, 'Reload Listys before saving more changes.')
  }
  const input = parseWithSchema(versionedSessionItemInputSchema, data)
  const fields = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    ...(input.unit !== undefined ? { unit: input.unit } : {}),
    ...(input.checked !== undefined ? { checked: input.checked } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
  }
  const { data: result, error } = await supabase.rpc('update_shopping_session_item_versioned', {
    p_item_id: id, p_expected_version: input.expected_version, p_fields: fields,
  })
  if (error) throwSessionItemRpcError(error)
  const parsed = z.object({ outcome: z.enum(['updated', 'conflict']), item: z.unknown() }).safeParse(result)
  if (!parsed.success) throwSessionItemRpcError({ message: 'INVALID_RPC_RESPONSE' })
  let item
  try { item = toSessionItemDto(parsed.data.item) } catch { throwSessionItemRpcError({ message: 'INVALID_RPC_RESPONSE' }) }
  if (parsed.data.outcome === 'conflict') {
    throw new ApiServiceError(409, ErrorCode.ITEM_VERSION_CONFLICT, 'This item changed on another device.', { current_item: item })
  }
  return item
}
