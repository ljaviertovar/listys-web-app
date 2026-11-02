import type {
	AttachTicketToSessionInput,
	TicketSessionCandidate,
	TicketSessionMatch,
} from '@/lib/api/endpoints'

export type AttachReviewLine = {
	ticketItemId: string
	name: string
	shoppingSessionItem: { id: string; name: string; checked: boolean } | null
}

export type AttachReview = {
	alreadyChecked: AttachReviewLine[]
	willBeChecked: AttachReviewLine[]
	notInTrip: AttachReviewLine[]
	/** Trip items that were checked off and have no line on the receipt: they stay as bought, without a price. */
	checkedNotOnReceipt: Array<{ id: string; name: string }>
	resultingStore: { id: string; name: string } | null
	confirmLabel: 'Attach and Complete Trip' | 'Attach to Trip'
	storeMismatch: boolean
	payload: AttachTicketToSessionInput
}

type AttachReviewInput = {
	candidate: TicketSessionCandidate
	lines: Array<{ id: string; name: string }>
	matches: TicketSessionMatch[]
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
	sessionItems?: Array<{ id: string; name: string; checked: boolean }>
	addedItemIds?: string[]
	linkedItems?: ReadonlyMap<string, string>
}

/** Builds the review groups, store result, confirmation and request from the user's choices. */
export function buildAttachReview({
	candidate,
	lines,
	matches,
	receiptStore,
	totalAmount,
	sessionItems = [],
	addedItemIds = [],
	linkedItems = new Map(),
}: AttachReviewInput): AttachReview {
	const matchByLine = new Map(matches.map(match => [match.ticket_item_id, match]))
	const sessionItemById = new Map(sessionItems.map(item => [item.id, item]))
	const added = new Set(addedItemIds)
	const alreadyChecked: AttachReviewLine[] = []
	const willBeChecked: AttachReviewLine[] = []
	const notInTrip: AttachReviewLine[] = []
	const links: NonNullable<AttachTicketToSessionInput['links']> = []

	for (const line of lines) {
		const match = matchByLine.get(line.id)
		const explicitTarget = linkedItems.get(line.id)
		const sessionItem = explicitTarget
			? sessionItemById.get(explicitTarget) ?? { id: explicitTarget, name: line.name, checked: false }
			: match?.shopping_session_item ?? null
		const reviewLine = { ticketItemId: line.id, name: line.name, shoppingSessionItem: sessionItem }

		if (explicitTarget && explicitTarget !== match?.shopping_session_item?.id) {
			links.push({ ticket_item_id: line.id, shopping_session_item_id: explicitTarget })
		}

		if (added.has(line.id)) {
			willBeChecked.push({ ...reviewLine, shoppingSessionItem: null })
		} else if (sessionItem?.checked) {
			alreadyChecked.push(reviewLine)
		} else if (sessionItem || explicitTarget) {
			willBeChecked.push(reviewLine)
		} else {
			notInTrip.push(reviewLine)
		}
	}

	// A trip item is "on the receipt" when a line matched or was linked to it; the rest that were checked keep no price.
	const itemsOnReceipt = new Set<string>()
	for (const line of [...alreadyChecked, ...willBeChecked]) if (line.shoppingSessionItem) itemsOnReceipt.add(line.shoppingSessionItem.id)
	for (const target of linkedItems.values()) itemsOnReceipt.add(target)
	const checkedNotOnReceipt = sessionItems
		.filter(item => item.checked && !itemsOnReceipt.has(item.id))
		.map(item => ({ id: item.id, name: item.name }))

	const resultingStore = candidate.store && receiptStore && candidate.store.id !== receiptStore.id
		? (candidate.status === 'active' ? receiptStore : candidate.store)
		: candidate.store ?? receiptStore
	const storeMismatch = candidate.status === 'completed'
		&& !!candidate.store && !!receiptStore && candidate.store.id !== receiptStore.id

	return {
		alreadyChecked,
		willBeChecked,
		notInTrip,
		checkedNotOnReceipt,
		resultingStore,
		confirmLabel: candidate.status === 'active' ? 'Attach and Complete Trip' : 'Attach to Trip',
		storeMismatch,
		payload: {
			shopping_session_id: candidate.id,
			...(links.length ? { links } : {}),
			...(addedItemIds.length ? { added_item_ids: addedItemIds } : {}),
			...(totalAmount !== null ? { total_amount: totalAmount } : {}),
		},
	}
}
