import { isUsablePrice } from '@/utils'

export interface EstimateSessionItem {
	id: string
	normalized_name: string | null
}

export interface EstimateBaseItem {
	normalized_name: string | null
	average_price: number | null
}

export interface SessionPriceEstimate {
	/** Average price of each session item that has one, by session item id. */
	priceByItemId: Map<string, number>
	/** Sum of those average prices. It is an estimate, never what was paid. */
	total: number
	pricedCount: number
	itemCount: number
}

/**
 * What a trip would cost going by what the list already knows. A session item takes the average price of the base-list
 * item with the same normalized name, so items added mid-trip are covered too. Only real prices count: a missing, zero,
 * negative or non-numeric average is "no data", never a $0. The total adds the averages as they are, without multiplying
 * by the session quantity, because an average price is the amount of a receipt line, not a unit price.
 */
export function buildSessionPriceEstimate(
	sessionItems: EstimateSessionItem[],
	baseItems: EstimateBaseItem[],
): SessionPriceEstimate {
	const averageByName = new Map<string, number>()
	for (const item of baseItems) {
		if (item.normalized_name && isUsablePrice(item.average_price)) averageByName.set(item.normalized_name, item.average_price)
	}

	const priceByItemId = new Map<string, number>()
	let total = 0
	for (const item of sessionItems) {
		const price = item.normalized_name ? averageByName.get(item.normalized_name) : undefined
		if (price === undefined) continue
		priceByItemId.set(item.id, price)
		total += price
	}

	return { priceByItemId, total, pricedCount: priceByItemId.size, itemCount: sessionItems.length }
}
