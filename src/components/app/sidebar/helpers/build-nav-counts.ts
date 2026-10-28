export type NavCountTone = 'neutral' | 'waiting'

export interface NavCount {
	value: number
	tone: NavCountTone
	/** What the number means, for screen readers: "2 lists", "1 receipt waiting". */
	label: string
}

interface Totals {
	listsCount: number | null
	receiptsWaiting: number | null
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * The count pills of the navigation, keyed by the link they belong to: lists are neutral, receipts that still wait for a
 * list are amber because they need a look. A count of zero (or one not loaded yet) shows nothing.
 */
export function buildNavCounts({ listsCount, receiptsWaiting }: Totals): Record<string, NavCount> {
	const counts: Record<string, NavCount> = {}
	if (listsCount) counts['/shopping-lists'] = { value: listsCount, tone: 'neutral', label: plural(listsCount, 'list', 'lists') }
	if (receiptsWaiting) {
		counts['/tickets'] = { value: receiptsWaiting, tone: 'waiting', label: `${plural(receiptsWaiting, 'receipt', 'receipts')} waiting` }
	}
	return counts
}
