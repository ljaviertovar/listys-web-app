import { groupByCategory } from '@/utils'
import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import type { LineDecision, MatchedItem } from '../../add-to-list/helpers/merge-review'

export type ReceiptTriageSectionId = 'check' | 'fresh' | 'matched'
export type ReceiptTriageStatus = 'loading' | 'switching' | 'ready' | 'failed' | 'unavailable'

/** Why a line has the badge it has: where it stands against the list, and what is still missing from the receipt. */
export type ReceiptTriageBadge = 'in-list' | 'new' | 'confirm-match' | 'no-price'

export type ReceiptTriageLine = {
	item: TicketItem
	match: TicketItemMatch | null
	section: ReceiptTriageSectionId
	badges: ReceiptTriageBadge[]
	/** The similar item the server proposes, until the user decides; null once decided or when nothing is similar. */
	proposal: MatchedItem | null
	/** What the user decided for the line on this screen, if anything. */
	decision: LineDecision | null
	/** The item the line updates when added; null when it becomes a new item. */
	target: MatchedItem | null
	remembered: boolean
}

export type ReceiptTriageCategory = {
	key: string
	title: string
	lines: ReceiptTriageLine[]
}

export type ReceiptTriageSection = {
	id: ReceiptTriageSectionId
	/** Every line of the section in receipt order; `categories` splits the same lines by category. */
	lines: ReceiptTriageLine[]
	categories: ReceiptTriageCategory[]
	startsFolded: boolean
}

/** Sections in the order the screen shows them. */
const SECTION_ORDER = ['check', 'fresh', 'matched'] as const

/**
 * Groups each receipt line by the attention it needs, then by category, preserving receipt order. A line is pending while its
 * price is missing or its proposed match is undecided; deciding the match moves it to where it ends up.
 */
export function buildReceiptTriage(
	items: TicketItem[],
	matches: TicketItemMatch[],
	decisions: ReadonlyMap<string, LineDecision> = new Map(),
): ReceiptTriageSection[] {
	const matchesByItem = new Map(matches.map(match => [match.ticket_item_id, match]))
	const lines: Record<ReceiptTriageSectionId, ReceiptTriageLine[]> = { check: [], fresh: [], matched: [] }

	for (const item of items) {
		const match = matchesByItem.get(item.id) ?? null
		const suggestion = match?.match === 'none' ? match.suggestion : null
		// Only a proposed match can be decided here; the rest of the decisions belong to the add dialog.
		const decision = suggestion ? decisions.get(item.id) ?? null : null
		const pendingMatch = suggestion !== null && decision === null
		const noPrice = item.price === null

		const byList = match?.match === 'name' || match?.match === 'alias'
		const linked = decision?.kind === 'link'
		const target = linked ? decision.item : byList ? match?.base_list_item ?? null : null

		const section: ReceiptTriageSectionId = pendingMatch || noPrice ? 'check' : byList || linked ? 'matched' : 'fresh'

		const badges: ReceiptTriageBadge[] = []
		if (pendingMatch) badges.push('confirm-match')
		else if (byList || linked) badges.push('in-list')
		else if (!noPrice) badges.push('new')
		if (noPrice) badges.push('no-price')

		lines[section].push({
			item,
			match,
			section,
			badges,
			proposal: pendingMatch ? suggestion : null,
			decision,
			target,
			remembered: match?.match === 'alias' && !linked,
		})
	}

	const visibleSections = SECTION_ORDER.filter(id => lines[id].length > 0)

	return visibleSections.map(id => ({
		id,
		lines: lines[id],
		categories: categorize(lines[id]),
		startsFolded: id === 'matched' && visibleSections.length > 1,
	}))
}

function categorize(sectionLines: ReceiptTriageLine[]): ReceiptTriageCategory[] {
	const lineByItem = new Map(sectionLines.map(line => [line.item.id, line]))
	return groupByCategory(sectionLines.map(line => line.item)).map(group => ({
		key: group.key,
		title: group.title,
		lines: group.items.flatMap(item => lineByItem.get(item.id) ?? []),
	}))
}
