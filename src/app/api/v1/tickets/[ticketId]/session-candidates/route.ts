import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { getTicketSessionCandidates } from '@/lib/server/services/tickets.service'

export async function GET(_request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    return success(await getTicketSessionCandidates(ticketId))
  })
}
