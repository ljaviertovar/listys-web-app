import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/zod'
import { createBaseListSchema } from '@/lib/validations/base-list'
import { createBaseList, getBaseLists } from '@/lib/server/services/base-lists.service'

export async function GET() {
  return withApiHandler(async () => {
    const data = await getBaseLists()
    return success(data)
  })
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createBaseListSchema)
    const data = await createBaseList(body)
    return success(data, 201)
  })
}
