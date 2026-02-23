import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { sessionIdParamsSchema } from '@/lib/validations/api/common'
import { completeShoppingSessionSchema } from '@/lib/validations/shopping-session'
import { completeShoppingSession } from '@/lib/server/services/shopping-sessions.service'

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    const body = await parseJsonBody(request, completeShoppingSessionSchema)
    const data = await completeShoppingSession(sessionId, body)
    return success(data)
  })
}
