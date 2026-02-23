import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { sessionIdParamsSchema } from '@/lib/validations/api/common'
import { cancelShoppingSession } from '@/lib/server/services/shopping-sessions.service'

export async function POST(_: Request, { params }: { params: Promise<unknown> }) {
  const response = await withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    const data = await cancelShoppingSession(sessionId)
    return success(data)
  })

  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', 'Wed, 30 Sep 2026 23:59:59 GMT')
  response.headers.set('Link', '</api/v1/shopping-sessions/{sessionId}>; rel="successor-version"')
  return response
}
