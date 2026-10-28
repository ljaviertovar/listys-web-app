import { apiGet } from '@/lib/api/client'

export type SpendingSummary = {
	from: string
	to: string
	receipts_count: number
	total: number
	trips_count: number
	trips_without_total: number
}

export async function getSpending(from: string, to: string) {
	const query = new URLSearchParams({ from, to })
	return apiGet<SpendingSummary>(`/api/v1/spending?${query.toString()}`)
}
