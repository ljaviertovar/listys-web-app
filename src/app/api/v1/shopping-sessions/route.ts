import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseSearchParams } from '@/lib/api/zod'
import { createShoppingSessionSchema } from '@/lib/validations/shopping-session'
import { shoppingSessionsQuerySchema } from '@/lib/validations/api/common'
import { createShoppingSession, getActiveShoppingSession, getShoppingHistory } from '@/lib/server/services/shopping-sessions.service'

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const query = parseSearchParams(request, shoppingSessionsQuerySchema)

    if (query.status === 'active') {
      const data = await getActiveShoppingSession()
      return success(data)
    }

    if (query.status === 'completed' || !query.status) {
      const data = await getShoppingHistory()
      return success(data)
    }

    const data = await getShoppingHistory()
    return success(data)
  })
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createShoppingSessionSchema)
    const data = await createShoppingSession(body)
    return success(data, 201)
  })
}
