import { withApiHandler, failure, ErrorCode, noContent } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { createAuthenticatedClient } from '@/lib/api/auth'
import { itemIdParamsSchema } from '@/lib/validations/api/common'
import { deleteShoppingSessionItem } from '@/lib/server/services/shopping-sessions.service'

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async ({ requestId }) => {
    await createAuthenticatedClient()
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    const response = failure(410, ErrorCode.CLIENT_UPDATE_REQUIRED, 'Reload Listys before saving more changes.', { requestId })
    response.headers.set('Link', `</api/v2/shopping-session-items/${itemId}>; rel="successor-version"`)
    return response
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    await deleteShoppingSessionItem(itemId)
    return noContent()
  })
}
