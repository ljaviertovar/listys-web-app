import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { sessionIdParamsSchema } from '@/lib/validations/api/common'
import { updateShoppingSessionSchema } from '@/lib/validations/shopping-session'
import { cancelShoppingSession, getShoppingSession, updateShoppingSession } from '@/lib/server/services/shopping-sessions.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    const data = await getShoppingSession(sessionId)
    return success(data)
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    const body = await parseJsonBody(request, updateShoppingSessionSchema)
    const data = await updateShoppingSession(sessionId, body)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { sessionId } = await parseRouteParams(params, sessionIdParamsSchema)
    await cancelShoppingSession(sessionId)
    return noContent()
  })
}
