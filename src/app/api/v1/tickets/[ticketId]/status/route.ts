import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { getTicketStatus } from '@/lib/server/services/tickets.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const data = await getTicketStatus(ticketId)
    return success(data)
  })
}
