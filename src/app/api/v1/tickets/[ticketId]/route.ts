import { withApiHandler, success, noContent } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { updateTicketSchema } from '@/lib/validations/ticket'
import { deleteTicket, getTicket, updateTicket } from '@/lib/server/services/tickets.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const data = await getTicket(ticketId)
    return success(data)
  })
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    await deleteTicket(ticketId)
    return noContent()
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const body = await parseJsonBody(request, updateTicketSchema)
    const data = await updateTicket(ticketId, body)
    return success(data)
  })
}
