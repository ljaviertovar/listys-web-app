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
