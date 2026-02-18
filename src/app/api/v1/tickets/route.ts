import { withApiHandler, success } from '@/lib/api/http'
import { getTickets, uploadTicket } from '@/lib/server/services/tickets.service'

export async function GET() {
  return withApiHandler(async () => {
    const data = await getTickets()
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
