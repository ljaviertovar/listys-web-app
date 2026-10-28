import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseSearchParams } from '@/lib/api/zod'
import { spendingQuerySchema } from '@/lib/validations/api/spending'

export type SpendingSummaryDto = {
	from: string
	to: string
	receipts_count: number
	total: number
	trips_count: number
	trips_without_total: number
}

export async function getSpending(request: Request) {
	const { from, to } = parseSearchParams(request, spendingQuerySchema)
	const { supabase } = await createAuthenticatedClient()
	const { data, error } = await supabase.rpc('spending_summary', { p_from: from, p_to: to })

	if (error) {
		console.error('[spending] could not load summary', { code: error.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your spending summary. Please try again.')
	}

	const summary = Array.isArray(data) ? data[0] : data
	return {
		from,
		to,
		receipts_count: Number(summary?.receipts_count ?? 0),
		total: Number(summary?.total ?? 0),
		trips_count: Number(summary?.trips_count ?? 0),
		trips_without_total: Number(summary?.trips_without_total ?? 0),
	}
}
