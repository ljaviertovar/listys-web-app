import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { baseListIdParamsSchema } from '@/lib/validations/api/common'
import { createInviteLinkSchema } from '@/lib/validations/sharing'
import { createInviteLink, listInviteLinks } from '@/lib/server/services/sharing.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const data = await listInviteLinks(baseListId)
    return success(data)
  })
}

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const body = await parseJsonBody(request, createInviteLinkSchema)
    const data = await createInviteLink(baseListId, body)
    return success(data, 201)
  })
}
