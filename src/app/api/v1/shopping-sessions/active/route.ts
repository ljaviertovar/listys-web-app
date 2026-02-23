import { withApiHandler, success } from '@/lib/api/http'
import { getActiveShoppingSession } from '@/lib/server/services/shopping-sessions.service'

export async function GET() {
  const response = await withApiHandler(async () => {
    const data = await getActiveShoppingSession()
    return success(data)
  })

  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', 'Wed, 30 Sep 2026 23:59:59 GMT')
  response.headers.set('Link', '</api/v1/shopping-sessions?status=active>; rel="successor-version"')
  return response
}
