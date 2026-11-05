import type { TicketSessionMatch } from '@/lib/api/endpoints'
import { decisionsEqual, resolveDecision, type LineDecision } from './line-decision'
import type { ReviewReceiptLine } from './read-ticket-for-review'

export function createReviewDecisions(): ReadonlyMap<string, LineDecision> {
	return new Map()
}

/** Returning to the default removes the override, so the receipt remains the single source for its automatic matches. */
export function changeReviewDecision(current: ReadonlyMap<string, LineDecision>, line: ReviewReceiptLine, match: TicketSessionMatch | undefined, decision: LineDecision): ReadonlyMap<string, LineDecision> {
	const next = new Map(current)
	if (decisionsEqual(decision, resolveDecision(line, match))) next.delete(line.id)
	else next.set(line.id, decision)
	return next
}
