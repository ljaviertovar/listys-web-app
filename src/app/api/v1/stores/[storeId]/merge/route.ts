import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { storeIdParamsSchema } from '@/lib/validations/api/common'
import { mergeStoresSchema } from '@/lib/validations/store'
import { mergeStores } from '@/lib/server/services/stores.service'

// A domain command, not an attribute update: it moves receipts and names into this store and removes the source store.
export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { storeId } = await parseRouteParams(params, storeIdParamsSchema)
    const body = await parseJsonBody(request, mergeStoresSchema)
    const data = await mergeStores(storeId, body)
    return success(data)
  })
}
