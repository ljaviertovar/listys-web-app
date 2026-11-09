import { ApiServiceError, ErrorCode, withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { itemIdParamsSchema } from '@/lib/validations/api/common'
import { updateShoppingSessionItem } from '@/lib/server/services/shopping-sessions.service'
import { versionedSessionItemInputSchema } from '../contract'

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async ({ requestId }) => {
    const started = performance.now()
    try {
      const origin = request.headers.get('origin')
      const target = new URL(request.url)
      // Next may use its internal localhost URL behind the public request Host.
      // Browsers cannot choose Host; compare Origin to the externally addressed host.
      const host = request.headers.get('host')
      if (host) target.host = host
      if (origin && origin !== target.origin) {
        throw new ApiServiceError(403, ErrorCode.UNAUTHORIZED, 'This request must come from this app.')
      }
      if (!request.headers.get('content-type')?.split(';')[0].trim().endsWith('/json')) {
        throw new ApiServiceError(415, ErrorCode.BAD_REQUEST, 'Send the item as JSON.')
      }
      const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
      const body = await parseJsonBody(request, versionedSessionItemInputSchema)
      const data = await updateShoppingSessionItem(itemId, body)
      console.info('[trip-item-save]', { request_id: requestId, code: 'SAVED', duration_ms: Math.round(performance.now() - started) })
      return success(data)
    } catch (error) {
      const safe = error instanceof ApiServiceError ? error : new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Could not save this item. Please try again.')
      console.info('[trip-item-save]', { request_id: requestId, code: safe.code, duration_ms: Math.round(performance.now() - started) })
      throw safe
    }
  })
}
