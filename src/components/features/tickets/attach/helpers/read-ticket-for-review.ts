export type ReviewReceiptLine = {
	id: string
	name: string
	price?: number | null
	quantity?: number | null
	unit?: string | null
	normalized_name?: string | null
}

export type TripReviewTicket = {
	lines: ReviewReceiptLine[]
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** What the review needs from a receipt read, or null when the response is not a receipt with lines. Anything else in it is ignored. */
export function readTicketForReview(value: unknown): TripReviewTicket | null {
	if (!isRecord(value) || !Array.isArray(value.items)) return null

	const lines = value.items.flatMap(item =>
		isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string' ? [{
			id: item.id, name: item.name,
			price: typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : null,
			quantity: typeof item.quantity === 'number' && Number.isFinite(item.quantity) ? item.quantity : null,
			unit: typeof item.unit === 'string' ? item.unit : null,
			normalized_name: typeof item.normalized_name === 'string' ? item.normalized_name : null,
		}] : [],
	)
	const store = value.store
	if (lines.length === 0) return null
	const receiptStore = isRecord(store) && typeof store.id === 'string' && typeof store.name === 'string' ? { id: store.id, name: store.name } : null

	return {
		lines,
		receiptStore,
		totalAmount: typeof value.total_amount === 'number' ? value.total_amount : null,
	}
}
