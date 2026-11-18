/**
 * What the estimate is based on, as the lines under it. The count of checked items is already in the progress chart, so the
 * lines only say how much of it is priced: a single line when every checked item has a price, two when some do not.
 */
export function describeEstimateBasis({ itemCount, pricedCount }: { itemCount: number; pricedCount: number }): string[] {
	if (itemCount === 0) return ['Nothing checked yet']
	if (pricedCount === 0) return ['No known prices for the checked items']
	if (pricedCount === itemCount) return [`Based on ${itemCount} checked ${itemCount === 1 ? 'item' : 'items'}`]
	return [`Based on ${pricedCount} of ${itemCount} checked items`, `${itemCount - pricedCount} without a price yet`]
}
