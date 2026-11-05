import type { TicketSessionMatch } from '@/lib/api/endpoints'

import type { ReviewReceiptLine } from './read-ticket-for-review'

export type LineDecision = { kind: 'add' } | { kind: 'match'; itemId: string } | { kind: 'leave' }
export type LineChoice = { kind: LineDecision['kind']; disabled: boolean; reason?: string; itemIds?: string[] }

export function hasReadableName(line: ReviewReceiptLine): boolean {
	return /[\p{L}\p{N}]/u.test(line.name)
}

export function resolveDecision(line: ReviewReceiptLine, match?: TicketSessionMatch, overrides: ReadonlyMap<string, LineDecision> = new Map()): LineDecision {
	if (!hasReadableName(line)) return { kind: 'leave' }
	const override = overrides.get(line.id)
	if (override) return override
	return match?.shopping_session_item && match.match !== 'none'
		? { kind: 'match', itemId: match.shopping_session_item.id }
		: { kind: 'add' }
}

export function decisionsEqual(a: LineDecision, b: LineDecision): boolean {
	return a.kind === b.kind && (a.kind !== 'match' || (b.kind === 'match' && a.itemId === b.itemId))
}

export function getAvailableChoices(line: ReviewReceiptLine, match?: TicketSessionMatch): LineChoice[] {
	if (!hasReadableName(line)) return [
		{ kind: 'add', disabled: true, reason: 'The name couldn’t be read.' },
		{ kind: 'match', disabled: true, reason: 'The name couldn’t be read.' },
		{ kind: 'leave', disabled: false },
	]
	return [
		{ kind: 'add', disabled: match?.match === 'name' || match?.match === 'alias', reason: match && match.match !== 'none' ? 'Already matches a trip item.' : undefined },
		{ kind: 'match', disabled: false, itemIds: match?.match === 'name' && match.shopping_session_item ? [match.shopping_session_item.id] : undefined },
		{ kind: 'leave', disabled: false },
	]
}

export function toRequestParts(line: ReviewReceiptLine, decision: LineDecision, match?: TicketSessionMatch) {
	if (!hasReadableName(line)) return {}
	if (decision.kind === 'add') return { addedItemId: line.id }
	if (decision.kind === 'match' && decision.itemId !== match?.shopping_session_item?.id) {
		return { link: { ticket_item_id: line.id, shopping_session_item_id: decision.itemId } }
	}
	if (decision.kind === 'leave' && match && match.match !== 'none') {
		return { link: { ticket_item_id: line.id, shopping_session_item_id: null } }
	}
	return {}
}
