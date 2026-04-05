import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { z } from 'zod'
import { listCollaborators, removeCollaborator } from '@/lib/server/services/sharing.service'
import { baseListIdParamsSchema } from '@/lib/validations/api/common'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId } = await parseRouteParams(params, baseListIdParamsSchema)
    const data = await listCollaborators(baseListId)
    return success(data)
  })
}
