import { formatDate } from '@/utils'
import type { Store } from '@/types'

/** The quiet line under a store's name: when it was last visited and how many items it is the usual store of. */
export function buildStoreMeta(store: Pick<Store, 'last_visit' | 'usual_items_count'>): string | null {
	const parts: string[] = []
	if (store.last_visit?.at) parts.push(`Last ${formatDate(new Date(store.last_visit.at))}`)
	const usual = store.usual_items_count ?? 0
	if (usual > 0) parts.push(`${usual} ${usual === 1 ? 'item' : 'items'} usually here`)
	return parts.length > 0 ? parts.join(' · ') : null
}
