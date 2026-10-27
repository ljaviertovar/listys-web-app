import type { Store } from '@/types'

const comparable = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * The key the database compares store names by (`normalize_store_name`): accents, case, spaces and punctuation ignored,
 * "#123" and a trailing number of 3+ digits dropped. Keep the two in step, or the picker offers names the server refuses.
 */
export function storeNameKey(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/#\s*\d+/g, ' ')
		.replace(/\s\d{3,}\s*$/, '')
		.replace(/[^a-z0-9]+/g, '')
}

/**
 * Stores whose name contains the search text, ignoring case and extra spaces, or whose key contains its key (so
 * "NOFRILLS #3127" finds "No Frills"); all of them for an empty search.
 */
export function filterStores(stores: Store[], query: string, excludeStoreId?: string | null): Store[] {
	const needle = comparable(query)
	const needleKey = storeNameKey(query)
	return stores.filter(
		store =>
			store.id !== excludeStoreId &&
			(!needle || comparable(store.name).includes(needle) || (needleKey !== '' && storeNameKey(store.name).includes(needleKey))),
	)
}

/**
 * Whether the search text could become a new store: it has a key, fits in 100 characters, and no store has the same key.
 * Aliases the client cannot see still make the server answer with an existing store, which the receipt then uses.
 */
export function canCreateStore(stores: Store[], query: string): boolean {
	const name = comparable(query)
	const key = storeNameKey(query)
	return key !== '' && name.length <= 100 && !stores.some(store => storeNameKey(store.name) === key)
}

/**
 * The line above the picker's rows. "No match" only makes sense once something was searched; with no store to pick (none
 * at all, or only the one being changed or merged) it says so, and says a name can be typed when creating is allowed.
 */
export function pickerStatus({
	total,
	others,
	matches,
	allowCreate,
}: {
	total: number
	others: number
	matches: number
	allowCreate: boolean
}): string {
	if (others === 0) {
		if (total === 0) return allowCreate ? 'You have no stores yet. Type a name to create the first one.' : 'You have no stores yet.'
		return allowCreate ? 'You have no other stores. Type a name to create one.' : 'You have no other stores.'
	}
	if (matches === 0) return 'No store matches this search.'
	return `${matches} ${matches === 1 ? 'store' : 'stores'}`
}
