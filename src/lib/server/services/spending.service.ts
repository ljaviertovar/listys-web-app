import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseSearchParams } from '@/lib/api/zod'
import { spendingQuerySchema } from '@/lib/validations/api/spending'

export type SpendingStoreDto = { id: string; name: string; total: number }

export type SpendingSummaryDto = {
	from: string
	to: string
	receipts_count: number
	total: number
	trips_count: number
	trips_without_total: number
	/** What was spent at each store in the range, largest first; trips and receipts without a store are left out. */
	stores: SpendingStoreDto[]
	/** What the total holds beyond the listed stores: receipts without a confirmed store and stores past the first few. Never negative. */
	other_total: number
}

/** Stores listed in the breakdown: the rest of the spend is still in `total`. */
const MAX_SPENDING_STORES = 5

type StoreReference = { id: string; name: string }
type AmountRow = { total_amount: number | null; store: StoreReference | StoreReference[] | null }
type TripAmountRow = AmountRow & { id: string }
type AttachedReceiptAmountRow = AmountRow & { shopping_session_id: string; attached_total_amount: number | null }

/** Groups trips by attached receipt totals; trips without receipts use their selected store and trip total. */
function sumByStore(rows: AmountRow[]): SpendingStoreDto[] {
	const totals = new Map<string, SpendingStoreDto>()
	for (const row of rows) {
		const store = Array.isArray(row.store) ? row.store[0] : row.store
		if (!store || typeof row.total_amount !== 'number') continue
		const entry = totals.get(store.id) ?? { id: store.id, name: store.name, total: 0 }
		entry.total += row.total_amount
		totals.set(store.id, entry)
	}
	return [...totals.values()]
		.map(entry => ({ ...entry, total: Math.round(entry.total * 100) / 100 }))
		.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}

export async function getSpending(request: Request) {
	const { from, to } = parseSearchParams(request, spendingQuerySchema)
	const { supabase, user } = await createAuthenticatedClient()
	const [{ data, error }, trips, receipts] = await Promise.all([
		supabase.rpc('spending_summary', { p_from: from, p_to: to }),
		supabase
			.from('shopping_sessions')
			.select('id, total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.eq('status', 'completed')
			.gte('completed_at', from)
			.lt('completed_at', to),
		supabase
			.from('tickets')
			.select('total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.is('shopping_session_id', null)
			.gte('created_at', from)
			.lt('created_at', to)
			.not('total_amount', 'is', null)
			.not('store_id', 'is', null),
	])

	if (error) {
		console.error('[spending] could not load summary', { code: error.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'We couldn’t load your spending summary. Please try again.')
	}

	// The breakdown is a detail of the summary: if it cannot be read the total still shows, without the stores.
	const tripRows = (trips.data ?? []) as TripAmountRow[]
	const tripIds = tripRows.map(trip => trip.id)
	const attachedReceipts = !trips.error && tripIds.length > 0
		? await supabase.from('tickets')
			.select('shopping_session_id, attached_total_amount, total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.in('shopping_session_id', tripIds)
		: { data: [], error: trips.error }

	const breakdownFailed = Boolean(trips.error || receipts.error || attachedReceipts.error)
	if (breakdownFailed) console.error('[spending] could not load the store breakdown', { code: (trips.error ?? receipts.error ?? attachedReceipts.error)?.code })

	const summary = Array.isArray(data) ? data[0] : data
	const total = Number(summary?.total ?? 0)
	const attachedByTrip = new Map<string, AttachedReceiptAmountRow[]>()
	for (const receipt of (attachedReceipts.data ?? []) as AttachedReceiptAmountRow[]) {
		const receiptsForTrip = attachedByTrip.get(receipt.shopping_session_id) ?? []
		receiptsForTrip.push(receipt)
		attachedByTrip.set(receipt.shopping_session_id, receiptsForTrip)
	}
	const tripBreakdownRows = tripRows.flatMap(trip => {
		const tripReceipts = attachedByTrip.get(trip.id)
		return tripReceipts?.length
			? tripReceipts.map(receipt => ({ total_amount: receipt.attached_total_amount ?? receipt.total_amount, store: receipt.store }))
			: [{ total_amount: trip.total_amount, store: trip.store }]
	})
	const byStore = breakdownFailed ? [] : sumByStore([...tripBreakdownRows, ...((receipts.data ?? []) as AmountRow[])])
	const listed = byStore.slice(0, MAX_SPENDING_STORES)
	const listedTotal = listed.reduce((sum, store) => sum + store.total, 0)
	return {
		from,
		to,
		receipts_count: Number(summary?.receipts_count ?? 0),
		total,
		trips_count: Number(summary?.trips_count ?? 0),
		trips_without_total: Number(summary?.trips_without_total ?? 0),
		stores: listed,
		other_total: listed.length === 0 ? 0 : Math.max(0, Math.round((total - listedTotal) * 100) / 100),
	}
}
