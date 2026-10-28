import { withApiHandler, success } from '@/lib/api/http'
import { parseSearchParams } from '@/lib/api/zod'
import { getLikelyNeededItems } from '@/lib/server/services/base-lists.service'
import { likelyNeededQuerySchema } from '@/lib/validations/api/likely-needed'

export async function GET(request: Request) {
	return withApiHandler(async () => {
		const { limit } = parseSearchParams(request, likelyNeededQuerySchema)
		const result = await getLikelyNeededItems(limit)
		return success(result.data, 200, result.meta)
	})
}
