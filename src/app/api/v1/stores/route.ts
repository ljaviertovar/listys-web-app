import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/zod'
import { createStoreSchema } from '@/lib/validations/store'
import { createStore, listStores } from '@/lib/server/services/stores.service'

export async function GET() {
  return withApiHandler(async () => {
    const { stores, meta } = await listStores()
    return success(stores, 200, meta)
  })
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createStoreSchema)
    const store = await createStore(body)
    const response = success(store, 201)
    response.headers.set('Location', `/api/v1/stores/${store.id}`)
    return response
  })
}
