import { withApiHandler, success } from '@/lib/api/http'
import { markStuckTicketsAsFailed } from '@/lib/server/services/tickets.service'

export async function POST() {
  return withApiHandler(async () => {
    const data = await markStuckTicketsAsFailed()
    return success(data)
  })
}
