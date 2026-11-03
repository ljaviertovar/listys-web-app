import type { TicketSessionCandidate } from '@/lib/api/endpoints'

import { describeCandidate } from './attach-candidates'

export type TripReviewPhase = 'closed' | 'loading' | 'error' | 'ready'

/** Where the review of a receipt against a trip stands, from what the hook knows: it is only `ready` once the comparison is in. */
export function getTripReviewPhase({
	open,
	loading,
	failed,
	hasReview,
}: {
	open: boolean
	loading: boolean
	failed: boolean
	hasReview: boolean
}): TripReviewPhase {
	if (!open) return 'closed'
	if (failed) return 'error'
	if (loading || !hasReview) return 'loading'
	return 'ready'
}

/**
 * The sheet's description. "Review how this receipt will update the trip" is an invitation to review, so it appears only once
 * there is something to review; while the receipt and the trip are still loading it says what is loading instead.
 */
export function describeTripReview(
	trip: Pick<TicketSessionCandidate, 'name' | 'store' | 'started_at' | 'completed_at'> | null,
	phase: TripReviewPhase,
): string {
	if (!trip) return 'Loading the trip this receipt is for.'
	const where = describeCandidate(trip)
	if (phase === 'ready') return `${where}. Review how this receipt will update the trip.`
	if (phase === 'error') return `${where}. We couldn’t load the comparison.`
	return `${where}. Loading the receipt and the trip…`
}
