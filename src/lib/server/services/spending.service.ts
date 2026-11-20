import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { parseSearchParams } from '@/lib/api/zod'
import { spendingQuerySchema, type SpendingQuery } from '@/lib/validations/api/spending'
import { calendarDateBoundary } from '@/utils/calendar-date'
import { readAllRows, readAllRowsForIds } from './read-all-rows'

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
	/** Receipt figures include uploads made from a trip while they are pending review. */
	receipt_total: number
	receipt_count: number
	average_receipt: number | null
	receipt_stores: SpendingStoreDto[]
	receipt_unknown_store_total: number
	categories: Array<{ name: string; total: number }>
	previous_receipt_total: number | null
	change_percent: number | null
	/** When the oldest receipt of the user was added, whatever the range: since when the app has been collecting. */
	first_receipt_at: string | null
	last_receipt_at: string | null
	first_purchase_date: string | null
	last_purchase_date: string | null
}

/** Stores listed in the breakdown: the rest of the spend is still in `total`. */
const MAX_SPENDING_STORES = 5

/** Preserve the timestamp bounds for completed trips and the legacy response fields. */
const ALL_TIME_FROM = '1970-01-01T00:00:00Z'
const DAY_MS = 24 * 60 * 60 * 1000

function resolveRange(query: SpendingQuery) {
	if (query.scope === 'all') return { from: ALL_TIME_FROM, to: new Date(Date.now() + DAY_MS).toISOString(), compare_from: undefined, compare_to: undefined }
	// The schema has already required both dates when the scope is not `all`.
	return { from: query.from as string, to: query.to as string, compare_from: query.compare_from, compare_to: query.compare_to }
}

function receiptRange(from: string, to: string, timeZone: string) {
	const purchaseFrom = calendarDateBoundary(from, timeZone)
	const purchaseTo = calendarDateBoundary(to, timeZone)
	const uploadedFrom = new Date(from).toISOString()
	const uploadedTo = new Date(to).toISOString()
	return {
		purchaseFrom,
		purchaseTo,
		uploadedFrom,
		uploadedTo,
		filter: `and(purchase_date.gte.${purchaseFrom},purchase_date.lt.${purchaseTo}),and(purchase_date.is.null,created_at.gte.${uploadedFrom},created_at.lt.${uploadedTo})`,
	}
}

function filterReceipts<T extends { or(filter: string): T; gte(column: string, value: string): T; lt(column: string, value: string): T }>(query: T, range: ReturnType<typeof receiptRange> | null, uploadDateOnly = false): T {
	if (!range) return query
	return uploadDateOnly
		? query.gte('created_at', range.uploadedFrom).lt('created_at', range.uploadedTo)
		: query.or(range.filter)
}

function isMissingPurchaseDateColumn(error: { code?: string } | null) {
	return error?.code === '42703' || error?.code === 'PGRST204'
}

type StoreReference = { id: string; name: string }
type AmountRow = { total_amount: number | null; store: StoreReference | StoreReference[] | null }
type TripAmountRow = AmountRow & { id: string }
type AttachedReceiptAmountRow = AmountRow & { shopping_session_id: string; attached_total_amount: number | null }
async function getReceiptBackedSummary(supabase: Awaited<ReturnType<typeof createAuthenticatedClient>>['supabase'], userId: string, range: ReturnType<typeof receiptRange> | null) {
	const sessions = await readAllRows((start, end) => supabase.from('shopping_sessions').select('id').eq('user_id', userId).in('status', ['active', 'completed']).order('id').range(start, end))
	if (sessions.error) {
		console.error('[spending] could not load receipt-backed summary', { code: sessions.error.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load spending summary.')
	}
	const tripIds = (sessions.data ?? []).map(session => session.id)
	const readReceiptSets = async (uploadDateOnly = false) => {
		const receiptQuery = () => filterReceipts(supabase.from('tickets')
			.select('id, total_amount, attached_total_amount, store:stores(id, name)')
			.eq('user_id', userId)
			.order('id'), range, uploadDateOnly)
		const standalone = await readAllRows((start, end) => receiptQuery()
			.eq('include_in_spending', true)
			.is('shopping_session_id', null)
			.is('uploaded_from_session_id', null)
			.gte('total_amount', 0)
			.range(start, end))
		// Read pending first so a receipt confirmed during this request still counts.
		const pending = await readAllRowsForIds(tripIds, (chunk, start, end) => receiptQuery()
			.in('uploaded_from_session_id', chunk)
			.is('shopping_session_id', null)
			.is('base_list_id', null)
			.range(start, end))
		const attached = await readAllRowsForIds(tripIds, (chunk, start, end) => receiptQuery()
			.in('shopping_session_id', chunk)
			.range(start, end))
		return { standalone, pending, attached }
	}
	let receiptSets = await readReceiptSets()
	const missingPurchaseDate = [receiptSets.standalone.error, receiptSets.pending.error, receiptSets.attached.error]
		.find(isMissingPurchaseDateColumn)
	if (range && missingPurchaseDate) {
		console.error('[spending] purchase date is unavailable; using upload dates', { code: missingPurchaseDate.code })
		receiptSets = await readReceiptSets(true)
	}
	const { standalone, pending, attached } = receiptSets
	if (attached.error || pending.error || standalone.error) {
		console.error('[spending] could not load eligible receipts', { code: attached.error?.code ?? pending.error?.code ?? standalone.error?.code })
		throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, 'Unable to load spending summary.')
	}
	// A review confirmed between queries can make a receipt appear in both reads.
	const receipts = new Map((pending.data ?? []).map(receipt => [receipt.id, receipt]))
	for (const receipt of standalone.data ?? []) {
		if (!receipts.has(receipt.id)) receipts.set(receipt.id, { ...receipt, attached_total_amount: null })
	}
	for (const receipt of attached.data ?? []) receipts.set(receipt.id, receipt)
	const spendableReceipts = [...receipts.values()].flatMap(receipt => {
		const total = receipt.attached_total_amount ?? receipt.total_amount
		if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) return []
		return [{ id: receipt.id, total_amount: total, store: receipt.store }]
	})
	const ids = spendableReceipts.map(receipt => receipt.id)
	const itemResult = await readAllRowsForIds(ids, (chunk, start, end) => supabase.from('ticket_items').select('ticket_id, category, price, quantity').in('ticket_id', chunk).order('id').range(start, end))
	if (itemResult.error) console.error('[spending] could not load receipt categories', { code: itemResult.error.code })
	const itemsByTicket = new Map<string, typeof itemResult.data>()
	for (const item of itemResult.data ?? []) {
		const lines = itemsByTicket.get(item.ticket_id) ?? []
		lines.push(item)
		itemsByTicket.set(item.ticket_id, lines)
	}
	const byCategory = new Map<string, number>()
	for (const { id } of spendableReceipts) for (const item of itemsByTicket.get(id) ?? []) {
		if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) continue
		const quantity = typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1
		const name = item.category?.trim() || 'Other'
		byCategory.set(name, (byCategory.get(name) ?? 0) + item.price * quantity)
	}
	const total = Math.round(spendableReceipts.reduce((sum, row) => sum + row.total_amount, 0) * 100) / 100
	const unknownStoreTotal = spendableReceipts.reduce((sum, row) => sum + (getStore(row) ? 0 : row.total_amount), 0)
	return {
		receipt_total: total,
		receipt_count: spendableReceipts.length,
		average_receipt: spendableReceipts.length ? Math.round(total / spendableReceipts.length * 100) / 100 : null,
		receipt_stores: sumByStore(spendableReceipts).slice(0, MAX_SPENDING_STORES),
		receipt_unknown_store_total: Math.round(unknownStoreTotal * 100) / 100,
		categories: [...byCategory].map(([name, amount]) => ({ name, total: Math.round(amount * 100) / 100 })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)).slice(0, 5),
	}
}

/**
 * When the oldest (`first`) or the newest (`last`) receipt of the user was added: the start of what the dashboard has read so far, and
 * the last time it read something. They are details of the summary, so when one cannot be read the summary still answers, without it.
 */
async function getReceiptEdgeAt(supabase: Awaited<ReturnType<typeof createAuthenticatedClient>>['supabase'], userId: string, edge: 'first' | 'last'): Promise<string | null> {
	const { data, error } = await supabase.from('tickets').select('created_at').eq('user_id', userId).order('created_at', { ascending: edge === 'first' }).limit(1).maybeSingle()
	if (error) {
		console.error(`[spending] could not read the ${edge} receipt`, { code: error.code })
		return null
	}
	return data?.created_at ?? null
}

function getStore(row: AmountRow) {
	return Array.isArray(row.store) ? row.store[0] : row.store
}

function sumByStore(rows: AmountRow[]): SpendingStoreDto[] {
	const totals = new Map<string, SpendingStoreDto>()
	for (const row of rows) {
		const store = getStore(row)
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
	const query = parseSearchParams(request, spendingQuerySchema)
	const { from, to, compare_from, compare_to } = resolveRange(query)
	const timeZone = query.time_zone ?? 'UTC'
	const range = query.scope === 'all' ? null : receiptRange(from, to, timeZone)
	const comparison = compare_from && compare_to ? receiptRange(compare_from, compare_to, timeZone) : null
	const { supabase, user } = await createAuthenticatedClient()
	const [{ data, error }, trips, receipts, receiptSummary, previousReceiptSummary, firstReceiptAt, lastReceiptAt] = await Promise.all([
		supabase.rpc('spending_summary_by_purchase_date', {
			p_from: from, p_to: to,
			p_purchase_from: range?.purchaseFrom ?? null,
			p_purchase_to: range?.purchaseTo ?? null,
			p_time_zone: timeZone,
		}),
		readAllRows((start, end) => supabase
			.from('shopping_sessions')
			.select('id, total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.eq('status', 'completed')
			.gte('completed_at', from)
			.lt('completed_at', to)
			.order('id')
			.range(start, end)),
		readAllRows((start, end) => filterReceipts(supabase
			.from('tickets')
			.select('id, total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.is('shopping_session_id', null)
			.order('id'), range)
			.range(start, end)),
		getReceiptBackedSummary(supabase, user.id, range),
		comparison ? getReceiptBackedSummary(supabase, user.id, comparison) : Promise.resolve(null),
		getReceiptEdgeAt(supabase, user.id, 'first'),
		getReceiptEdgeAt(supabase, user.id, 'last'),
	])

	if (error) console.error('[spending] could not load legacy summary', { code: error.code })

	// The breakdown is a detail of the summary: if it cannot be read the total still shows, without the stores.
	const tripRows = (trips.data ?? []) as TripAmountRow[]
	const tripIds = tripRows.map(trip => trip.id)
	const attachedReceipts = !trips.error
		? await readAllRowsForIds(tripIds, (chunk, start, end) => supabase.from('tickets')
			.select('shopping_session_id, attached_total_amount, total_amount, store:stores(id, name)')
			.eq('user_id', user.id)
			.in('shopping_session_id', chunk)
			.order('id')
			.range(start, end))
		: { data: [], error: trips.error }

	const breakdownFailed = Boolean(trips.error || receipts.error || attachedReceipts.error)
	if (breakdownFailed) console.error('[spending] could not load the store breakdown', { code: (trips.error ?? receipts.error ?? attachedReceipts.error)?.code })

	const summary = Array.isArray(data) ? data[0] : data
	// The chart is backed by eligible receipts, so a legacy summary RPC failure must not hide it.
	const total = Number(summary?.total ?? receiptSummary.receipt_total)
	const previousTotal = previousReceiptSummary?.receipt_total ?? null
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
		receipts_count: Number(summary?.receipts_count ?? receiptSummary.receipt_count),
		total,
		trips_count: Number(summary?.trips_count ?? 0),
		trips_without_total: Number(summary?.trips_without_total ?? 0),
		stores: listed,
		other_total: listed.length === 0 ? 0 : Math.max(0, Math.round((total - listedTotal) * 100) / 100),
		...receiptSummary,
		previous_receipt_total: previousTotal,
		change_percent: previousTotal && previousTotal > 0 ? Math.round(((receiptSummary.receipt_total - previousTotal) / previousTotal) * 100) : null,
		first_receipt_at: firstReceiptAt,
		last_receipt_at: lastReceiptAt,
		first_purchase_date: summary?.first_purchase_date ?? null,
		last_purchase_date: summary?.last_purchase_date ?? null,
	}
}
