import { formatCurrency, formatDate } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

type PickerItem = Pick<BaseListItemWithStoreSummary, 'usual_store' | 'purchase_total' | 'other_stores' | 'store_prices'>

export interface UsualStorePickerInfo {
	/** How the item's usual store is decided right now, in one line. */
	headline: string
	body: string
	/** What each store the item was bought at has to say, by store id: when and at what price it was last bought there. */
	details: Record<string, string>
}

/** The facts the usual-store sheet shows about one item, from what its receipts recorded. */
export function buildUsualStorePickerInfo(item: PickerItem): UsualStorePickerInfo {
	const usual = item.usual_store ?? null
	const total = item.purchase_total ?? 0
	const details: Record<string, string> = {}

	for (const store of item.other_stores ?? []) {
		details[store.id] = `${store.purchase_count} ${store.purchase_count === 1 ? 'purchase' : 'purchases'}`
	}
	if (usual && (usual.purchase_count ?? 0) > 0) {
		details[usual.id] = `${usual.purchase_count} ${usual.purchase_count === 1 ? 'purchase' : 'purchases'}`
	}
	// A recorded price says more than a count, so it wins.
	for (const entry of item.store_prices ?? []) {
		const when = entry.last_price_at ? ` · ${formatDate(new Date(entry.last_price_at))}` : ''
		details[entry.store.id] = `Last ${formatCurrency(entry.last_price)}${when}`
	}

	if (!usual) {
		return {
			headline: 'No usual store yet',
			body: total > 0
				? `Bought ${total} ${total === 1 ? 'time' : 'times'} with a receipt. It takes 3 purchases at the same store to tag an item.`
				: 'It takes 3 purchases with a receipt at the same store to tag an item.',
			details,
		}
	}
	if (usual.source === 'manual') {
		return { headline: `Set by you · ${usual.name}`, body: 'It stays there until you change it.', details }
	}
	return {
		headline: `Automatic · ${usual.name}`,
		body: total > 0 && (usual.purchase_count ?? 0) > 0
			? `Bought there ${usual.purchase_count} of ${total} ${total === 1 ? 'time' : 'times'}. Follows your receipts.`
			: 'Follows your receipts.',
		details,
	}
}
