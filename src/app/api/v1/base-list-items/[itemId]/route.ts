import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { itemIdParamsSchema } from '@/lib/validations/api/common'
import { updateBaseListItemSchema } from '@/lib/validations/base-list'
import { deleteBaseListItem, updateBaseListItem } from '@/lib/server/services/base-lists.service'

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    const body = await parseJsonBody(request, updateBaseListItemSchema)
    const data = await updateBaseListItem(itemId, body)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { itemId } = await parseRouteParams(params, itemIdParamsSchema)
    await deleteBaseListItem(itemId)
    return noContent()
  })
}
