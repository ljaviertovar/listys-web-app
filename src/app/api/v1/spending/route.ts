import { success, withApiHandler } from '@/lib/api/http'
import { getSpending } from '@/lib/server/services/spending.service'

export async function GET(request: Request) {
	return withApiHandler(async () => {
		const summary = await getSpending(request)
		return success(summary)
	})
}
