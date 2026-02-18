import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { baseListIdParamsSchema } from '@/lib/validations/api/common'
import { createBaseListItemSchema } from '@/lib/validations/base-list'
import { createBaseListItem } from '@/lib/server/services/base-lists.service'

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
