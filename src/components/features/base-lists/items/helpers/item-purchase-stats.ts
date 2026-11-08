import type { BaseListItemWithStoreSummary } from '@/types'

/** The same mean interval used by Likely Needed, without deriving a value from a single purchase. */
export function getItemPurchaseStats(item: Pick<BaseListItemWithStoreSummary, 'purchase_count' | 'first_seen_at' | 'last_purchased_at'>) {
	const span = item.first_seen_at && item.last_purchased_at ? Date.parse(item.last_purchased_at) - Date.parse(item.first_seen_at) : NaN
	const intervalDays = item.purchase_count > 1 && Number.isFinite(span) && span > 0 ? span / (86_400_000 * (item.purchase_count - 1)) : null
	return { purchaseCount: item.purchase_count, intervalDays, lastBought: item.purchase_count > 0 ? item.last_purchased_at : null }
}
