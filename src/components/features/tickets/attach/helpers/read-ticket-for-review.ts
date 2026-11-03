export type TripReviewTicket = {
	lines: Array<{ id: string; name: string }>
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** What the review needs from a receipt read, or null when the response is not a receipt with lines. Anything else in it is ignored. */
export function readTicketForReview(value: unknown): TripReviewTicket | null {
	if (!isRecord(value) || !Array.isArray(value.items)) return null

	const lines = value.items.flatMap(item =>
		isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string' ? [{ id: item.id, name: item.name }] : [],
	)
	const store = value.store
	const receiptStore = isRecord(store) && typeof store.id === 'string' && typeof store.name === 'string' ? { id: store.id, name: store.name } : null

	return {
		lines,
		receiptStore,
		totalAmount: typeof value.total_amount === 'number' ? value.total_amount : null,
	}
}
