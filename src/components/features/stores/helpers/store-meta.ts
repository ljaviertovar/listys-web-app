import { formatShortDate } from '@/utils'
import type { DataFact } from '@/components/commons'
import type { Store } from '@/types'

/** The data line under a store's name: "Last visit 12 Nov" and the receipts as a figure. Nothing when both are missing. */
export function buildStoreFacts(store: Pick<Store, 'last_visit' | 'receipt_count'>, now = new Date()): DataFact[] {
	const facts: DataFact[] = []
	if (store.last_visit?.at) facts.push({ value: `Last visit ${formatShortDate(new Date(store.last_visit.at), now)}` })
	if (store.receipt_count > 0) facts.push({ kind: 'time', value: store.receipt_count, unit: store.receipt_count === 1 ? 'receipt' : 'receipts' })
	return facts
}
