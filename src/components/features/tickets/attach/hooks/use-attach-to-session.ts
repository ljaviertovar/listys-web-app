'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getTicketSessionCandidates, type TicketSessionCandidate } from '@/lib/api/endpoints'
import type { TicketItem } from '@/types'

import { useTripReview } from './use-trip-review'

/**
 * The receipt page's side of attaching: it finds the trip the receipt was uploaded from and reviews against it. Opening the
 * review, its choices and the confirmation are the trip review's; this adds only the offer and where to go afterwards.
 */
export function useAttachToSession({
	ticketId,
	items,
	receiptStore,
	totalAmount,
}: {
	ticketId: string
	items: TicketItem[]
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
}) {
	const router = useRouter()
	const [candidates, setCandidates] = useState<TicketSessionCandidate[]>([])
	const [candidatesLoading, setCandidatesLoading] = useState(true)
	const [candidatesError, setCandidatesError] = useState<string | null>(null)

	const loadCandidates = useCallback(async () => {
		setCandidatesLoading(true)
		setCandidatesError(null)
		const result = await getTicketSessionCandidates(ticketId)
		if (result.error) setCandidatesError(result.error)
		else setCandidates(result.data ?? [])
		setCandidatesLoading(false)
	}, [ticketId])

	useEffect(() => {
		let active = true
		getTicketSessionCandidates(ticketId).then(result => {
			if (!active) return
			if (result.error) setCandidatesError(result.error)
			else setCandidates(result.data ?? [])
			setCandidatesLoading(false)
		})
		return () => { active = false }
	}, [ticketId])

	// A receipt is only offered the trip it was uploaded from, so there is never a choice to make.
	const ticket = useMemo(() => ({
		lines: items.map(item => ({ id: item.id, name: item.name })),
		receiptStore,
		totalAmount,
	}), [items, receiptStore, totalAmount])

	const review = useTripReview({
		ticketId,
		trip: candidates[0] ?? null,
		ticket,
		onAttached: trip => {
			router.push(`/shopping/${trip.id}`)
			router.refresh()
		},
		onAlreadyAttached: () => void loadCandidates(),
	})

	return {
		...review,
		candidates, candidatesLoading, candidatesError, reloadCandidates: loadCandidates,
		openDialog: review.openReview,
	}
}
