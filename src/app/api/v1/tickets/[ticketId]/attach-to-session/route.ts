import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { attachTicketToSessionSchema } from '@/lib/validations/ticket'
import { attachTicketToSession } from '@/lib/server/services/tickets.service'

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const body = await parseJsonBody(request, attachTicketToSessionSchema)
    return success(await attachTicketToSession(ticketId, body))
  })
}
