import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { sessionIdParamsSchema } from '@/lib/validations/api/common'
import { createShoppingSessionItemSchema } from '@/lib/validations/shopping-session'
import { createShoppingSessionItem } from '@/lib/server/services/shopping-sessions.service'

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    const body = await parseJsonBody(
      request,
      createShoppingSessionItemSchema
        .omit({ shopping_session_id: true })
        .transform(data => ({ ...data, shopping_session_id: sessionId }))
    )
    const data = await createShoppingSessionItem(body)
    return success(data, 201)
  })
}
