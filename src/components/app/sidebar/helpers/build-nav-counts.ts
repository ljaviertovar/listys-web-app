export type NavCountTone = 'neutral' | 'waiting'

export interface NavCount {
	value: number
	tone: NavCountTone
	/** What the number means, for screen readers: "2 groups", "1 receipt waiting". */
	label: string
}

interface Totals {
	groupsCount: number | null
	receiptsWaiting: number | null
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * The count pills of the navigation, keyed by the link they belong to: groups are neutral, receipts that still wait for a
 * list are amber because they need a look. A count of zero (or one not loaded yet) shows nothing.
 */
export function buildNavCounts({ groupsCount, receiptsWaiting }: Totals): Record<string, NavCount> {
	const counts: Record<string, NavCount> = {}
	if (groupsCount) counts['/shopping-lists'] = { value: groupsCount, tone: 'neutral', label: plural(groupsCount, 'group', 'groups') }
	if (receiptsWaiting) {
		counts['/tickets'] = { value: receiptsWaiting, tone: 'waiting', label: `${plural(receiptsWaiting, 'receipt', 'receipts')} waiting` }
	}
	return counts
}
