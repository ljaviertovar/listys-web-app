import { z } from 'zod'

import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { assignTicketToGroup } from '@/lib/server/services/tickets.service'

const assignGroupSchema = z.object({
  groupId: z.string().uuid(),
})

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  const response = await withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const body = await parseJsonBody(request, assignGroupSchema)
    const data = await assignTicketToGroup(ticketId, body.groupId)
    return success(data)
  })

  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', 'Wed, 30 Sep 2026 23:59:59 GMT')
  response.headers.set('Link', '</api/v1/tickets/{ticketId}>; rel="successor-version"')
  return response
}
