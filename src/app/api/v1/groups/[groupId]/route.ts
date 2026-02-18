import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { groupIdParamsSchema } from '@/lib/validations/api/common'
import { updateGroupSchema } from '@/lib/validations/group'
import { deleteGroup, getGroup, updateGroup } from '@/lib/server/services/groups.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { groupId } = await parseRouteParams(params, groupIdParamsSchema)
    const data = await getGroup(groupId)
    return success(data)
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { groupId } = await parseRouteParams(params, groupIdParamsSchema)
    const body = await parseJsonBody(request, updateGroupSchema)
    const data = await updateGroup(groupId, body)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { groupId } = await parseRouteParams(params, groupIdParamsSchema)
    await deleteGroup(groupId)
    return noContent()
  })
}
