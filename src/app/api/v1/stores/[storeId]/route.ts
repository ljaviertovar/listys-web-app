import { withApiHandler, success } from '@/lib/api/http'
import { parseJsonBody, parseRouteParams } from '@/lib/api/zod'
import { storeIdParamsSchema } from '@/lib/validations/api/common'
import { updateStoreSchema } from '@/lib/validations/store'
import { getStoreDetail, renameStore } from '@/lib/server/services/stores.service'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { storeId } = await parseRouteParams(params, storeIdParamsSchema)
    const data = await getStoreDetail(storeId)
    return success(data)
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { storeId } = await parseRouteParams(params, storeIdParamsSchema)
    const body = await parseJsonBody(request, updateStoreSchema)
    const data = await renameStore(storeId, body)
    return success(data)
  })
}
