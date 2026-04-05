import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { z } from 'zod'
import { acceptInvite } from '@/lib/server/services/sharing.service'

const tokenParams = z.object({
  token: z.string().min(1),
})

export async function POST(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { token } = await parseRouteParams(params, tokenParams)
    const data = await acceptInvite(token)
    return success(data)
  })
}
