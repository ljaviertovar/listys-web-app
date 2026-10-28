import type { TicketItemMatch } from '@/lib/api/endpoints'

export type MatchedItem = { id: string; name: string }

export interface ReviewLine {
	ticketItemId: string
	name: string
	/** The item the line updates by default: same name, or remembered from an earlier link. */
	matchedItem: MatchedItem | null
	suggestedItem?: MatchedItem
}

export interface MergeReview {
	/** Lines with the name of an item in the list: they update it and cannot be linked elsewhere. */
	byName: ReviewLine[]
	/** Lines that match an item through a link remembered from an earlier receipt. */
	remembered: ReviewLine[]
	/** Lines that would become new items. */
	fresh: ReviewLine[]
	/** New lines with a likely existing item, offered for explicit linking. */
	suggested: ReviewLine[]
	/** False when every line updates an item by name, so the items can be added without a review step. */
	needsReview: boolean
}

/** What the user chose for a remembered or new line; a line without a decision keeps its default. */
export type LineDecision = { kind: 'new' } | { kind: 'link'; item: MatchedItem }

export type MergeLink = { ticket_item_id: string; base_list_item_id: string | null }

/** Sorts the selected lines by how they match the chosen list. Lines the server did not describe count as new. */
export function buildMergeReview(
	matches: TicketItemMatch[],
	lines: Array<{ id: string; name: string }>,
	selectedIds: string[],
): MergeReview {
	const byId = new Map(matches.map(match => [match.ticket_item_id, match]))
	const names = new Map(lines.map(line => [line.id, line.name]))
	const review: MergeReview = { byName: [], remembered: [], fresh: [], suggested: [], needsReview: false }

	for (const id of selectedIds) {
		const match = byId.get(id)
		const line: ReviewLine = { ticketItemId: id, name: names.get(id) ?? '', matchedItem: match?.base_list_item ?? null }

		if (match?.match === 'name' && line.matchedItem) review.byName.push(line)
		else if (match?.match === 'alias' && line.matchedItem) review.remembered.push(line)
		else if (match?.match === 'none' && match.suggestion) {
			review.suggested.push({ ...line, matchedItem: null, suggestedItem: match.suggestion })
		} else review.fresh.push({ ...line, matchedItem: null })
	}

	review.needsReview = review.remembered.length + review.fresh.length + review.suggested.length > 0
	return review
}

/**
 * The `links` to send: only decisions that change a line's default. A remembered line added as new sends null (the link is
 * forgotten); a remembered line moved to another item, or a new line linked to an item, sends that item.
 */
export function buildMergeLinks(review: MergeReview, decisions: ReadonlyMap<string, LineDecision>): MergeLink[] {
	const links: MergeLink[] = []

	for (const line of review.remembered) {
		const decision = decisions.get(line.ticketItemId)
		if (decision?.kind === 'new') links.push({ ticket_item_id: line.ticketItemId, base_list_item_id: null })
		if (decision?.kind === 'link' && decision.item.id !== line.matchedItem?.id) {
			links.push({ ticket_item_id: line.ticketItemId, base_list_item_id: decision.item.id })
		}
	}

	for (const line of review.fresh) {
		const decision = decisions.get(line.ticketItemId)
		if (decision?.kind === 'link') links.push({ ticket_item_id: line.ticketItemId, base_list_item_id: decision.item.id })
	}

	for (const line of review.suggested) {
		const decision = decisions.get(line.ticketItemId)
		if (decision?.kind === 'link') links.push({ ticket_item_id: line.ticketItemId, base_list_item_id: decision.item.id })
	}

	return links
}

/** The item a remembered or new line will update, after the user's decision; null when it becomes a new item. */
export function resolvedItem(line: ReviewLine, decision: LineDecision | undefined): MatchedItem | null {
	if (decision?.kind === 'new') return null
	if (decision?.kind === 'link') return decision.item
	return line.matchedItem
}
