import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/zod'
import { createGroupSchema } from '@/lib/validations/group'
import { createGroup, getGroups } from '@/lib/server/services/groups.service'

export async function GET() {
  return withApiHandler(async () => {
    const data = await getGroups()
    return success(data)
  })
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createGroupSchema)
    const data = await createGroup(body)
    return success(data, 201)
  })
}
