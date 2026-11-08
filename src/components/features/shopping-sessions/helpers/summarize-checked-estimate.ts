/** Keep unchecked row prices available while accumulating only collected items. */
export function summarizeCheckedEstimate(
	items: ReadonlyArray<{ id: string; checked: boolean | null }>,
	prices: ReadonlyMap<string, number>,
) {
	let total = 0
	let pricedCount = 0
	let itemCount = 0
	for (const item of items) {
		if (item.checked !== true) continue
		itemCount++
		const price = prices.get(item.id)
		if (price === undefined) continue
		total += price
		pricedCount++
	}
	return { total, pricedCount, itemCount }
}
