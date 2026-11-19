export const MAX_SPENDING_STORES = 3

export type SpendingSlice = {
	/** `store-0`…`store-2` or `other`: the key of the chart config and of its colour variable. */
	key: string
	name: string
	total: number
	/** A whole percent of the chart; the slices of one chart always add up to 100. */
	percent: number
	/** Only on the `other` slice: how many listed stores it groups. */
	storeCount: number
}

type StoreTotal = { id: string; name: string; total: number }

/**
 * The slices of the month's spend by store: the largest stores, then "Other" with whatever the month's total holds beyond them,
 * so a share is always a share of the month. Percentages use the largest-remainder rule so they add up to 100.
 */
export function buildSpendingSlices(stores: ReadonlyArray<StoreTotal>, monthTotal: number, unknownStoreTotal = 0): SpendingSlice[] {
	const ranked = stores.filter(store => store.total > 0).sort((a, b) => b.total - a.total)
	const named = ranked.slice(0, MAX_SPENDING_STORES)
	const namedTotal = named.reduce((sum, store) => sum + store.total, 0)
	const rest = monthTotal - namedTotal - unknownStoreTotal

	const raw = named.map((store, index) => ({
		key: `store-${index}`,
		name: store.name,
		total: store.total,
		storeCount: 0,
	}))
	// Cents of float noise are not a slice.
	if (rest >= 0.005) raw.push({ key: 'other', name: 'Other', total: rest, storeCount: ranked.length - named.length })
	if (unknownStoreTotal > 0) raw.push({ key: 'unknown-store', name: 'Unknown Store', total: unknownStoreTotal, storeCount: 0 })

	const sum = raw.reduce((total, slice) => total + slice.total, 0)
	if (sum <= 0) return []

	const exact = raw.map(slice => (slice.total / sum) * 100)
	const floors = exact.map(Math.floor)
	let left = 100 - floors.reduce((total, value) => total + value, 0)
	const byRemainder = exact.map((value, index) => ({ index, remainder: value - floors[index] })).sort((a, b) => b.remainder - a.remainder)
	for (const { index } of byRemainder) {
		if (left <= 0) break
		floors[index] += 1
		left -= 1
	}
	return raw.map((slice, index) => ({ ...slice, percent: floors[index] }))
}
