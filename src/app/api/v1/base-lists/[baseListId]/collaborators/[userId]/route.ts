import { withApiHandler, noContent } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { z } from 'zod'
import { removeCollaborator } from '@/lib/server/services/sharing.service'

const collaboratorParams = z.object({
  baseListId: z.string().uuid(),
  userId: z.string().uuid(),
})

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId, userId } = await parseRouteParams(params, collaboratorParams)
    await removeCollaborator(baseListId, userId)
    return noContent()
  })
}
