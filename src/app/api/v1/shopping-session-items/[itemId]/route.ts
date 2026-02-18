import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { itemIdParamsSchema } from '@/lib/validations/api/common'
import { updateShoppingSessionItemSchema } from '@/lib/validations/shopping-session'
import { deleteShoppingSessionItem, updateShoppingSessionItem } from '@/lib/server/services/shopping-sessions.service'

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    const body = await parseJsonBody(request, updateShoppingSessionItemSchema)
    const data = await updateShoppingSessionItem(itemId, body)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    await deleteShoppingSessionItem(itemId)
    return noContent()
  })
}
