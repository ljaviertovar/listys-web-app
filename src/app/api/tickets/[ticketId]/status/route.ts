import { NextResponse } from 'next/server'
import { fromUnknownError } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { ticketIdParamsSchema } from '@/lib/validations/api/common'
import { getTicketStatus } from '@/lib/server/services/tickets.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  const requestId = crypto.randomUUID()
  try {
    const { ticketId } = await parseRouteParams(params, ticketIdParamsSchema)
    const data = await getTicketStatus(ticketId)
    return NextResponse.json(data)
  } catch (error) {
    const response = fromUnknownError(error, requestId)
    const payload = (await response.json()) as { error?: { message?: string } }
    return NextResponse.json({ error: payload.error?.message ?? 'Internal error' }, { status: response.status })
  }
}
