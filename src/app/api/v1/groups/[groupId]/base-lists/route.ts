import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { groupIdParamsSchema } from '@/lib/validations/api/common'
import { getBaseListsByGroup } from '@/lib/server/services/base-lists.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { groupId } = await parseRouteParams(params, groupIdParamsSchema)
    const data = await getBaseListsByGroup(groupId)
    return success(data)
  })
}
