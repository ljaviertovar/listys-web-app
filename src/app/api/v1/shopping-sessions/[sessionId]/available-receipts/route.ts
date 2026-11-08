import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { sessionIdParamsSchema } from '@/lib/validations/api/common'
import { listAvailableReceipts } from '@/lib/server/services/shopping-sessions.service'

export async function GET(_request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    return success(await listAvailableReceipts(sessionId))
  })
}
