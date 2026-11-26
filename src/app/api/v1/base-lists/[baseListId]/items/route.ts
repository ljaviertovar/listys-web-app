import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { baseListIdParamsSchema } from '@/lib/validations/api/common'
import { createBaseListItemSchema, setBaseListItemsNeededSchema } from '@/lib/validations/base-list'
import { createBaseListItem, setBaseListItemsNeeded } from '@/lib/server/services/base-lists.service'

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const body = await parseJsonBody(request, setBaseListItemsNeededSchema)
    const data = await setBaseListItemsNeeded(baseListId, body)
    return success(data)
  })
}

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const body = await parseJsonBody(
      request,
      createBaseListItemSchema.omit({ base_list_id: true }).transform(data => ({ ...data, base_list_id: baseListId }))
    )
    const data = await createBaseListItem(body)
    return success(data, 201)
  })
}
