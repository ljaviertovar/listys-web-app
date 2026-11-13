import { apiGet } from '@/lib/api/client'

export type SpendingSummary = {
	from: string
	to: string
	receipts_count: number
	total: number
	trips_count: number
	trips_without_total: number
	/** What was spent at each store, largest first (a few); trips and receipts without a store are not in it. */
	stores?: Array<{ id: string; name: string; total: number }>
	/** What the total holds beyond those stores (receipts without a confirmed store, stores past the first few). */
	other_total?: number
	receipt_total?: number
	receipt_count?: number
	average_receipt?: number | null
	receipt_stores?: Array<{ id: string; name: string; total: number }>
	categories?: Array<{ name: string; total: number }>
	previous_receipt_total?: number | null
	change_percent?: number | null
}

export async function getSpending(from: string, to: string, compareFrom?: string, compareTo?: string) {
  const query = new URLSearchParams({ from, to })
  if (compareFrom && compareTo) {
    query.set('compare_from', compareFrom)
    query.set('compare_to', compareTo)
  }
	return apiGet<SpendingSummary>(`/api/v1/spending?${query.toString()}`)
}
