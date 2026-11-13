import { withApiHandler, success } from '@/lib/api/http'
import { parseSearchParams } from '@/lib/api/zod'
import { ticketsQuerySchema } from '@/lib/validations/api/common'
import { getTickets, uploadTicket } from '@/lib/server/services/tickets.service'

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const { source } = parseSearchParams(request, ticketsQuerySchema)
    const data = await getTickets(source)
    return success(data)
  })
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const formData = await request.formData()
    const data = await uploadTicket(formData)
    return success(data, 202)
  })
}
