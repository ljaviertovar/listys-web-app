'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { AttachToSessionDialog } from '@/components/features/tickets/attach/attach-to-session-dialog'
import { useTripReview } from '@/components/features/tickets/attach/hooks/use-trip-review'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'

interface TripReceiptReviewProps {
	ticketId: string
	trip: TicketSessionCandidate
	/** The review closed: cancelled, or the receipt was attached. */
	onClose: () => void
}

/**
 * The review of one receipt against the trip being viewed. It is mounted when a receipt is chosen or ready and opens at once;
 * it loads the receipt and the comparison itself, so nothing is asked of the server before the user gets here. Attaching
 * refreshes the trip, which then shows the receipt; closing leaves the receipt unattached and the trip unchanged.
 */
export function TripReceiptReview({ ticketId, trip, onClose }: TripReceiptReviewProps) {
	const router = useRouter()
	const review = useTripReview({
		ticketId,
		trip,
		onAttached: () => router.refresh(),
		onClosed: onClose,
	})

	const opened = useRef(false)
	useEffect(() => {
		if (opened.current) return
		opened.current = true
		review.openReview()
	})

	return <AttachToSessionDialog actions={review} />
}
