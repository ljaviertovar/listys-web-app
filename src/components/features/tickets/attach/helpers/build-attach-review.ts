import type { AttachTicketToSessionInput, TicketSessionCandidate, TicketSessionMatch } from '@/lib/api/endpoints'

import { describeLineResult } from './describe-line-result'
import { resolveDecision, toRequestParts, type LineDecision } from './line-decision'
import { planQuantityChange, type ReviewSessionItem } from './plan-quantity-change'
import type { ReviewReceiptLine } from './read-ticket-for-review'

export type ReviewSectionId = 'new' | 'will-be-checked' | 'already-checked' | 'left-out'
export type AttachReviewLine = ReviewReceiptLine & ReturnType<typeof describeLineResult> & {
	ticketItemId: string
	decision: LineDecision
	shoppingSessionItem: ReviewSessionItem | null
}
export type ReviewSection = { id: ReviewSectionId; lines: AttachReviewLine[] }
export type PriorReceiptLine = { shopping_session_item_id: string | null; quantity: number | null; unit: string | null }

type AttachReviewInput = {
	candidate: TicketSessionCandidate
	lines: ReviewReceiptLine[]
	matches: TicketSessionMatch[]
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
	sessionItems?: ReviewSessionItem[]
	decisions?: ReadonlyMap<string, LineDecision>
	coveredItemIds?: ReadonlySet<string>
	previousLines?: PriorReceiptLine[]
}

/** One decision model drives the sections, counters and payload, so changing a row cannot disagree with confirmation. */
export function buildAttachReview({ candidate, lines, matches, receiptStore, totalAmount, sessionItems = [], decisions = new Map(), coveredItemIds = new Set(), previousLines = [] }: AttachReviewInput) {
	const matchByLine = new Map(matches.map(match => [match.ticket_item_id, match]))
	const itemById = new Map(sessionItems.map(item => [item.id, item]))
	const resolved = lines.map(line => {
		const match = matchByLine.get(line.id)
		const decision = resolveDecision(line, match, decisions)
		const target = decision.kind === 'match' ? itemById.get(decision.itemId) ?? match?.shopping_session_item ?? null : null
		return { line, match, decision, item: target ? { ...target, checked: target.checked || coveredItemIds.has(target.id) } : null }
	})
	const groups: Record<ReviewSectionId, AttachReviewLine[]> = { new: [], 'will-be-checked': [], 'already-checked': [], 'left-out': [] }
	const addedItemIds: string[] = []
	const links: NonNullable<AttachTicketToSessionInput['links']> = []
	const onReceipt = new Set(coveredItemIds)
	const quantityLines = new Map<string, Array<{ quantity?: number | null; unit?: string | null }>>()
	for (const line of previousLines) {
		if (!line.shopping_session_item_id) continue
		const current = quantityLines.get(line.shopping_session_item_id) ?? []
		current.push(line)
		quantityLines.set(line.shopping_session_item_id, current)
	}
	for (const entry of resolved) {
		if (entry.decision.kind === 'match') {
			onReceipt.add(entry.decision.itemId)
			const current = quantityLines.get(entry.decision.itemId) ?? []
			current.push(entry.line)
			quantityLines.set(entry.decision.itemId, current)
		}
	}
	for (const { line, match, decision, item } of resolved) {
		const origin = decision.kind === 'match' && decision.itemId !== match?.shopping_session_item?.id ? 'user' : match?.match ?? 'none'
		const quantityChange = item ? planQuantityChange(item, quantityLines.get(item.id) ?? []) : null
		const decorated = { ...line, ticketItemId: line.id, decision, shoppingSessionItem: item,
			...describeLineResult({ line, decision, item, origin, quantityChange }) }
		const section = decision.kind === 'add' ? 'new' : decision.kind === 'leave' ? 'left-out' : item?.checked ? 'already-checked' : 'will-be-checked'
		groups[section].push(decorated)
		const part = toRequestParts(line, decision, match)
		if (part.addedItemId) addedItemIds.push(part.addedItemId)
		if (part.link) links.push(part.link)
	}
	const counts = { matched: groups['will-be-checked'].length + groups['already-checked'].length, added: groups.new.length, leftOut: groups['left-out'].length }
	const checkedNotOnReceipt = sessionItems.filter(item => item.checked && !onReceipt.has(item.id))
	const notCheckedNotOnReceipt = sessionItems.filter(item => !item.checked && !onReceipt.has(item.id))
	return {
		sections: (Object.keys(groups) as ReviewSectionId[]).map(id => ({ id, lines: groups[id] })),
		counts, checkedNotOnReceipt, notCheckedNotOnReceipt,
		allMatch: counts.matched > 0 && counts.added === 0 && counts.leftOut === 0 && checkedNotOnReceipt.length === 0,
		resultingStore: candidate.store ?? receiptStore,
		storeMismatch: false,
		confirmLabel: candidate.status === 'active' ? 'Attach and Complete Trip' : 'Attach to Trip',
		payload: {
			shopping_session_id: candidate.id,
			...(links.length ? { links } : {}),
			...(addedItemIds.length ? { added_item_ids: addedItemIds } : {}),
			...(totalAmount !== null ? { total_amount: totalAmount } : {}),
		} satisfies AttachTicketToSessionInput,
	}
}

export type AttachReview = ReturnType<typeof buildAttachReview>
