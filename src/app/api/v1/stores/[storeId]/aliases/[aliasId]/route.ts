import { withApiHandler, noContent } from '@/lib/api/http'
import { parseRouteParams } from '@/lib/api/zod'
import { storeAliasParamsSchema } from '@/lib/validations/api/common'
import { removeStoreAlias } from '@/lib/server/services/stores.service'

/** Removes one name a store answers to on receipts; the store's own name is refused with `422`. */
export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  return withApiHandler(async () => {
    const { storeId, aliasId } = await parseRouteParams(params, storeAliasParamsSchema)
    await removeStoreAlias(storeId, aliasId)
    return noContent()
  })
}
