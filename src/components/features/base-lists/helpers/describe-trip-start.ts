import type { BaseListItemWithStoreSummary } from '@/types'

import { itemsForStore } from '../items/helpers/store-session-summary'

export interface TripStart {
	/** The trip takes only checked items. Otherwise it takes the whole list, as a trip always has. */
	onlyChecked: boolean
	/** What the estimate covers: the checked items taken, or else the list (its store items when a store is chosen). */
	estimateItems: BaseListItemWithStoreSummary[]
	summary: string
	scopeDetail: string
	notice: { tone: 'info' | 'warning'; title: string; lead: string; strong: string; rest: string }
	buttonLabel: string
}

const itemWord = (count: number) => (count === 1 ? 'item' : 'items')

/** "Rice stays…", "Rice and Foil stay…", "Rice and 3 more stay…". */
function describeLeftovers(names: string[]) {
	if (names.length === 0) return ''
	const [first, second] = names
	const subject = names.length === 1 ? first : names.length === 2 ? `${first} and ${second}` : `${first} and ${names.length - 1} more`
	return ` ${subject} ${names.length === 1 ? 'stays' : 'stay'} checked for another trip.`
}

/**
 * What "Start Shopping" will do with the checks on a list, in the words of the sheet. With nothing checked, or nothing
 * checked at the chosen store, the trip is the whole list; otherwise it is the checked items (of that store).
 */
export function describeTripStart({
	items,
	listName,
	store,
	formatName = name => name,
}: {
	items: BaseListItemWithStoreSummary[]
	listName: string
	store: { id: string; name: string } | null
	formatName?: (name: string) => string
}): TripStart {
	const total = items.length
	const checked = items.filter(item => item.needed_at)
	const storeItems = store ? itemsForStore(items, store.id) : items
	const taken = store ? itemsForStore(checked, store.id) : checked
	const onlyChecked = taken.length > 0

	const base = {
		onlyChecked,
		estimateItems: onlyChecked ? taken : storeItems,
		summary: checked.length > 0 ? `${checked.length} of ${total} ${itemWord(total)} checked` : `${total} ${itemWord(total)} · none checked`,
		scopeDetail: checked.length > 0
			? store
				? `${taken.length} of your ${checked.length} checked ${itemWord(checked.length)}`
				: `${checked.length} checked ${itemWord(checked.length)}`
			: store
				? `${storeItems.length} of ${total} ${itemWord(total)}`
				: `${total} ${itemWord(total)}`,
		buttonLabel: store ? `Start Shopping at ${store.name}` : 'Start Shopping',
	}
	const everything = `all ${total} ${itemWord(total)}`
	const lead = 'This trip starts with '

	if (onlyChecked && !store) {
		const others = total - taken.length
		return {
			...base,
			notice: {
				tone: 'info',
				title: 'Only your checked items',
				lead: `${lead}the `,
				strong: `${taken.length} ${itemWord(taken.length)} you checked`,
				rest: others > 0 ? `. The other ${others} ${others === 1 ? 'stays' : 'stay'} on the list.` : '.',
			},
			buttonLabel: `Start Shopping · ${taken.length} ${taken.length === 1 ? 'Item' : 'Items'}`,
		}
	}

	if (onlyChecked && store) {
		const takenIds = new Set(taken.map(item => item.id))
		const leftovers = checked.filter(item => !takenIds.has(item.id)).map(item => formatName(item.name))
		return {
			...base,
			notice: {
				tone: 'info',
				title: `Only checked ${store.name} items`,
				lead,
				strong: `${taken.length} ${itemWord(taken.length)}`,
				rest: `.${describeLeftovers(leftovers)}`,
			},
		}
	}

	if (!store) {
		return { ...base, notice: { tone: 'info', title: 'Nothing checked', lead, strong: everything, rest: ` in “${listName}”.` } }
	}

	if (checked.length > 0) {
		const first = storeItems.length > 0 ? `, ${store.name}’s ${storeItems.length} first` : ''
		const kept = checked.length === 1 ? 'item stays checked until you buy it' : 'items stay checked until you buy them'
		return {
			...base,
			notice: {
				tone: 'warning',
				title: `Nothing checked at ${store.name}`,
				lead,
				strong: everything,
				rest: `${first}. Your ${checked.length} checked ${kept}.`,
			},
		}
	}

	const others = total - storeItems.length
	const rest = storeItems.length === 0
		? `. None are from ${store.name}, so they are listed under Other Stores and Untagged.`
		: others === 0
			? `. All of them are from ${store.name}.`
			: `. The ${storeItems.length} from ${store.name} ${storeItems.length === 1 ? 'comes' : 'come'} first. The other ${others} ${others === 1 ? 'is' : 'are'} folded below.`
	return { ...base, notice: { tone: 'info', title: 'Nothing checked', lead, strong: everything, rest } }
}
