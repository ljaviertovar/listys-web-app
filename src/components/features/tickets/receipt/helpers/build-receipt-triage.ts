import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

export type ReceiptTriageSectionId = 'check' | 'fresh' | 'matched'
export type ReceiptTriageStatus = 'loading' | 'ready' | 'failed' | 'unavailable'

export type ReceiptTriageLine = {
	item: TicketItem
	match: TicketItemMatch | null
	section: ReceiptTriageSectionId
	reasons: string[]
	remembered: boolean
}

export type ReceiptTriageSection = {
	id: ReceiptTriageSectionId
	lines: ReceiptTriageLine[]
	startsFolded: boolean
}

/** Groups each receipt line by the attention it needs, preserving receipt order within each section. */
export function buildReceiptTriage(items: TicketItem[], matches: TicketItemMatch[]): ReceiptTriageSection[] {
	const matchesByItem = new Map(matches.map(match => [match.ticket_item_id, match]))
	const lines: Record<ReceiptTriageSectionId, ReceiptTriageLine[]> = { check: [], fresh: [], matched: [] }

	for (const item of items) {
		const match = matchesByItem.get(item.id) ?? null
		const reasons: string[] = []
		if (item.price === null) reasons.push('No price read')
		if (match?.suggestion) reasons.push(`Looks like ${match.suggestion.name}?`)

		const section: ReceiptTriageSectionId = reasons.length > 0 ? 'check' : match?.match === 'name' || match?.match === 'alias' ? 'matched' : 'fresh'
		lines[section].push({ item, match, section, reasons, remembered: match?.match === 'alias' })
	}

	const visibleSections = (['check', 'fresh', 'matched'] as const)
		.filter(id => lines[id].length > 0)

	return visibleSections.map(id => ({
		id,
		lines: lines[id],
		startsFolded: id === 'matched' && visibleSections.length > 1,
	}))
}
