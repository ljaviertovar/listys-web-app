import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams, parseSearchParams } from '@/lib/api/zod'
import { ticketIdParamsSchema, ticketSessionMatchesQuerySchema } from '@/lib/validations/api/common'
import { getTicketSessionMatches } from '@/lib/server/services/tickets.service'

export async function GET(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const { shopping_session_id } = parseSearchParams(request, ticketSessionMatchesQuerySchema)
    return success(await getTicketSessionMatches(ticketId, shopping_session_id))
  })
}
