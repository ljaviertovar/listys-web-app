type Store = { id: string; name: string }

/** The trip keeps its original store first; the receipts contribute other confirmed stores once each. */
export function getTripStores(store: Store | null | undefined, receipts: ReadonlyArray<{ store: Store | null }>): Store[] {
	const stores = new Map<string, Store>()
	for (const candidate of [store, ...receipts.map(receipt => receipt.store)]) {
		if (candidate && !stores.has(candidate.id)) stores.set(candidate.id, candidate)
	}
	return [...stores.values()]
}
