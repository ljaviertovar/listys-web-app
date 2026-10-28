import type { StorePriceEntry } from './item-store-summary'

export type StorePriceComparison = {
	cheapestStoreId: string | null
	comparableCount: number
	notComparable: boolean
}

function normalizeUnit(unit: string | null) {
	const value = unit?.trim().toLocaleLowerCase().replace(/\s+/g, ' ') ?? ''
	return !value || ['each', 'ea', 'unit', 'units', 'item', 'items'].includes(value) ? 'each' : value
}

/** Compares only receipt prices with a positive quantity in the same normalized unit. */
export function compareStorePrices(prices: StorePriceEntry[]): StorePriceComparison {
	const groups = new Map<string, Array<{ entry: StorePriceEntry; unitPrice: number }>>()
	for (const entry of prices) {
		if (entry.last_quantity === null || entry.last_quantity <= 0 || !Number.isFinite(entry.last_quantity)) continue
		const unit = normalizeUnit(entry.last_unit)
		const group = groups.get(unit) ?? []
		group.push({ entry, unitPrice: entry.last_price / entry.last_quantity })
		groups.set(unit, group)
	}

	const comparableGroups = [...groups.entries()].filter(([, group]) => group.length > 1)
	const largest = comparableGroups.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))[0]
	if (!largest) {
		return { cheapestStoreId: null, comparableCount: 0, notComparable: prices.length > 1 }
	}

	const candidates = largest[1].sort((a, b) =>
		a.unitPrice - b.unitPrice
		|| (b.entry.last_price_at ?? '').localeCompare(a.entry.last_price_at ?? '')
		|| a.entry.store.id.localeCompare(b.entry.store.id),
	)
	return {
		cheapestStoreId: candidates[0].entry.store.id,
		comparableCount: candidates.length,
		notComparable: groups.size > 1 || largest[1].length < prices.length,
	}
}
