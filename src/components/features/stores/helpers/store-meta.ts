import { formatDate } from '@/utils'
import type { Store } from '@/types'

/** The quiet line under a store's name: the last visit and total receipts. */
export function buildStoreMeta(store: Pick<Store, 'last_visit' | 'receipt_count'>): string | null {
	const parts: string[] = []
	if (store.last_visit?.at) parts.push(`Last ${formatDate(new Date(store.last_visit.at))}`)
	if (store.receipt_count > 0) parts.push(`${store.receipt_count} ${store.receipt_count === 1 ? 'receipt' : 'receipts'}`)
	return parts.length > 0 ? parts.join(' · ') : null
}
