import { withApiHandler, noContent } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { z } from 'zod'
import { revokeInviteLink } from '@/lib/server/services/sharing.service'

const inviteParams = z.object({
  baseListId: z.string().uuid(),
  inviteId: z.string().uuid(),
})

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { baseListId, inviteId } = await parseRouteParams(params, inviteParams)
    await revokeInviteLink(baseListId, inviteId)
    return noContent()
  })
}
