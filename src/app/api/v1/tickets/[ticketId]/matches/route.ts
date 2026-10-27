import { withApiHandler, success } from '@/lib/api/http'
import { parseRouteParams, parseSearchParams } from '@/lib/api/zod'
import { ticketIdParamsSchema, ticketMatchesQuerySchema } from '@/lib/validations/api/common'
import { getTicketMatches } from '@/lib/server/services/tickets.service'

// Every line of the receipt (at most MAX_TICKET_ITEMS_MERGE in practice), so the client filters its own selection and
// no list of item ids has to travel in the URL.
export async function GET(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const { base_list_id } = parseSearchParams(request, ticketMatchesQuerySchema)
    const data = await getTicketMatches(ticketId, base_list_id)
    return success(data)
  })
}
