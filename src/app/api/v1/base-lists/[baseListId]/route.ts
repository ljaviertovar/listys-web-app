import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { baseListIdParamsSchema } from '@/lib/validations/api/common'
import { updateBaseListSchema } from '@/lib/validations/base-list'
import { deleteBaseList, getBaseList, updateBaseList } from '@/lib/server/services/base-lists.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const data = await getBaseList(baseListId)
    return success(data)
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const body = await parseJsonBody(request, updateBaseListSchema)
    const data = await updateBaseList(baseListId, body)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    await deleteBaseList(baseListId)
    return noContent()
  })
}
