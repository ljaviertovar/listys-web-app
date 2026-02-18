import { z } from 'zod'

import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { mergeTicketItemsSchema } from '@/lib/validations/ticket'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { mergeTicketItemsToBaseList } from '@/lib/server/services/tickets.service'

const mergeRouteSchema = mergeTicketItemsSchema.omit({ ticket_id: true }).extend({
  ticket_id: z.string().uuid().optional(),
})

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const body = await parseJsonBody(request, mergeRouteSchema)
    const data = await mergeTicketItemsToBaseList({ ...body, ticket_id: ticketId })
    return success(data)
  })
}
