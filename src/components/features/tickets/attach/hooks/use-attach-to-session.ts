'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
	attachTicketToSession,
	getShoppingSession,
	getTicketSessionCandidates,
	getTicketSessionMatches,
	type TicketSessionCandidate,
	type TicketSessionMatch,
} from '@/lib/api/endpoints'
import type { TicketItem } from '@/types'

import { buildAttachReview, getAttachDialogStage } from '../helpers/build-attach-review'

type SessionItem = { id: string; name: string; checked: boolean }
type AttachError = { message: string; attached: boolean }

function readSessionItems(value: unknown): SessionItem[] {
	if (!value || typeof value !== 'object' || !('items' in value) || !Array.isArray(value.items)) return []
	return value.items.flatMap(item => {
		if (!item || typeof item !== 'object' || !('id' in item) || !('name' in item)) return []
		if (typeof item.id !== 'string' || typeof item.name !== 'string') return []
		return [{
			id: item.id,
			name: item.name,
			checked: 'checked' in item && item.checked === true,
		}]
	})
}

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
	const [open, setOpen] = useState(false)
	const [candidate, setCandidate] = useState<TicketSessionCandidate | null>(null)
	const [matches, setMatches] = useState<TicketSessionMatch[]>([])
	const [sessionItems, setSessionItems] = useState<SessionItem[]>([])
	const [reviewLoading, setReviewLoading] = useState(false)
	const [reviewError, setReviewError] = useState<string | null>(null)
	const [addedItemIds, setAddedItemIds] = useState<string[]>([])
	const [linkedItems, setLinkedItems] = useState<ReadonlyMap<string, string>>(new Map())
	const [linkingLineId, setLinkingLineId] = useState<string | null>(null)
	const [totalInput, setTotalInput] = useState(totalAmount === null ? '' : String(totalAmount))
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<AttachError | null>(null)

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

	const loadReview = useCallback(async (next: TicketSessionCandidate) => {
		setCandidate(next)
		setMatches([])
		setSessionItems([])
		setReviewError(null)
		setReviewLoading(true)
		const [matchResult, sessionResult] = await Promise.all([
			getTicketSessionMatches(ticketId, next.id),
			getShoppingSession(next.id),
		])
		if (matchResult.error) setReviewError(matchResult.error)
		else setMatches(matchResult.data ?? [])
		if (sessionResult.error && !matchResult.error) setReviewError(sessionResult.error)
		else if (!sessionResult.error) setSessionItems(readSessionItems(sessionResult.data))
		setReviewLoading(false)
	}, [ticketId])

	const openDialog = () => {
		setOpen(true)
		setSubmitError(null)
		setAddedItemIds([])
		setLinkedItems(new Map())
		if (getAttachDialogStage(candidates.length, null) === 'review') void loadReview(candidates[0])
	}

	const chooseCandidate = (id: string) => {
		const selected = candidates.find(entry => entry.id === id)
		if (selected) void loadReview(selected)
	}

	const review = useMemo(() => candidate ? buildAttachReview({
		candidate,
		lines: items.map(item => ({ id: item.id, name: item.name })),
		matches,
		sessionItems,
		receiptStore,
		totalAmount: totalInput.trim() === '' ? null : Number(totalInput),
		addedItemIds,
		linkedItems,
	}) : null, [candidate, items, matches, receiptStore, totalInput, addedItemIds, linkedItems])
	const totalIsValid = totalInput.trim() === '' || (Number.isFinite(Number(totalInput)) && Number(totalInput) >= 0)

	const toggleAdded = (id: string, checked: boolean) => {
		setAddedItemIds(current => checked ? [...current, id] : current.filter(itemId => itemId !== id))
		if (checked) setLinkedItems(current => {
			const next = new Map(current)
			next.delete(id)
			return next
		})
	}

	const linkLine = (lineId: string, itemId: string) => {
		setLinkedItems(current => new Map(current).set(lineId, itemId))
		setAddedItemIds(current => current.filter(itemId => itemId !== lineId))
		setLinkingLineId(null)
	}

	const submit = async () => {
		if (!candidate || !review || submitting) return
		setSubmitting(true)
		setSubmitError(null)
		const result = await attachTicketToSession(ticketId, review.payload)
		setSubmitting(false)
		if (result.error) {
			const reason = result.details && typeof result.details === 'object' && 'reason' in result.details
				? result.details.reason : null
			setSubmitError({ message: result.error, attached: reason === 'RECEIPT_ATTACHED' })
			if (reason === 'RECEIPT_ATTACHED') await loadCandidates()
			return
		}
		setOpen(false)
		router.push(`/shopping/${candidate.id}`)
		router.refresh()
	}

	return {
		candidates, candidatesLoading, candidatesError, reloadCandidates: loadCandidates,
		open, setOpen, openDialog, candidate, chooseCandidate, matches, sessionItems,
		reviewLoading, reviewError, retryReview: () => candidate && void loadReview(candidate),
		addedItemIds, toggleAdded, linkedItems, linkingLineId, setLinkingLineId, linkLine,
		totalInput, setTotalInput, totalIsValid, submitting, submitError, submit, review,
	}
}
