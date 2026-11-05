'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
	attachTicketToSession,
	getShoppingSession,
	getTicket,
	getTicketSessionMatches,
	type TicketSessionCandidate,
	type TicketSessionMatch,
	type AttachTicketToSessionInput,
} from '@/lib/api/endpoints'

import { buildAttachReview, type PriorReceiptLine } from '../helpers/build-attach-review'
import type { LineDecision } from '../helpers/line-decision'
import { changeReviewDecision, createReviewDecisions } from '../helpers/review-decisions'
import { describeAttachSuccess } from '../helpers/describe-attach-success'
import { readTicketForReview, type TripReviewTicket } from '../helpers/read-ticket-for-review'
import { getTripReviewPhase } from '../helpers/trip-review-phase'

type SessionItem = { id: string; name: string; checked: boolean; quantity?: number | null; unit?: string | null }
type AttachError = { message: string; attached: boolean }

function readPriorReceiptLines(value: unknown): PriorReceiptLine[] {
	if (!value || typeof value !== 'object' || !('receipts' in value) || !Array.isArray(value.receipts)) return []
	return value.receipts.flatMap(receipt => {
		if (!receipt || typeof receipt !== 'object' || !('lines' in receipt) || !Array.isArray(receipt.lines)) return []
		return receipt.lines.flatMap((line: unknown) => {
			if (!line || typeof line !== 'object' || !('shopping_session_item_id' in line) || typeof line.shopping_session_item_id !== 'string') return []
			return [{ shopping_session_item_id: line.shopping_session_item_id,
				quantity: 'quantity' in line && typeof line.quantity === 'number' ? line.quantity : null,
				unit: 'unit' in line && typeof line.unit === 'string' ? line.unit : null }]
		})
	})
}

function readSessionItems(value: unknown): SessionItem[] {
	if (!value || typeof value !== 'object' || !('items' in value) || !Array.isArray(value.items)) return []
	return value.items.flatMap(item => {
		if (!item || typeof item !== 'object' || !('id' in item) || !('name' in item)) return []
		if (typeof item.id !== 'string' || typeof item.name !== 'string') return []
		return [{
			id: item.id,
			name: item.name,
			checked: 'checked' in item && item.checked === true,
			quantity: 'quantity' in item && typeof item.quantity === 'number' ? item.quantity : null,
			unit: 'unit' in item && typeof item.unit === 'string' ? item.unit : null,
		}]
	})
}

interface UseTripReviewOptions {
	ticketId: string
	/** The trip the receipt would be attached to; null while it is not known yet. */
	trip: TicketSessionCandidate | null
	/** The receipt's lines, store and total when the caller already has them (the receipt page); otherwise they are loaded on open. */
	ticket?: TripReviewTicket | null
	/** After the receipt was attached; receives the trip so the caller can show it. */
	onAttached: (trip: TicketSessionCandidate) => void
	/** The server says the receipt is attached already, so the caller should refresh what it offers. */
	onAlreadyAttached?: () => void
	/** The review was closed, whether cancelled or after attaching, so a caller that mounted it for one receipt can drop it. */
	onClosed?: () => void
}

/**
 * The review of one receipt against one trip: it loads the comparison when opened, keeps the user's choices (lines to add,
 * lines linked to trip items, the total paid) and attaches on confirmation. Nothing is sent until `submit`, so closing the
 * review leaves the receipt and the trip as they were.
 */
export function useTripReview({ ticketId, trip, ticket: providedTicket = null, onAttached, onAlreadyAttached, onClosed }: UseTripReviewOptions) {
	const [open, setOpenState] = useState(false)
	const [ticket, setTicket] = useState<TripReviewTicket | null>(providedTicket)
	const [matches, setMatches] = useState<TicketSessionMatch[]>([])
	const [sessionItems, setSessionItems] = useState<SessionItem[]>([])
	const [reviewLoading, setReviewLoading] = useState(false)
	const [reviewError, setReviewError] = useState<string | null>(null)
	const [decisions, setDecisions] = useState(createReviewDecisions)
	const [editingLineId, setEditingLineId] = useState<string | null>(null)
	const [previousLines, setPreviousLines] = useState<PriorReceiptLine[]>([])
	const requestInFlight = useRef(false)
	const lastAttempt = useRef<AttachTicketToSessionInput | null>(null)
	const [totalInput, setTotalInput] = useState(providedTicket?.totalAmount == null ? '' : String(providedTicket.totalAmount))
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<AttachError | null>(null)

	const loadReview = useCallback(async (target: TicketSessionCandidate, known: TripReviewTicket | null) => {
		setMatches([])
		setSessionItems([])
		setPreviousLines([])
		setReviewError(null)
		setReviewLoading(true)

		const [ticketResult, matchResult, sessionResult] = await Promise.all([
			known ? Promise.resolve(null) : getTicket(ticketId),
			getTicketSessionMatches(ticketId, target.id),
			getShoppingSession(target.id),
		])

		let loadedTicket = known
		if (ticketResult) {
			loadedTicket = ticketResult.error ? null : readTicketForReview(ticketResult.data)
			if (loadedTicket) {
				setTicket(loadedTicket)
				setTotalInput(loadedTicket.totalAmount === null ? '' : String(loadedTicket.totalAmount))
			}
		}

		if (!loadedTicket) setReviewError(ticketResult?.error ?? 'We couldn’t load this receipt.')
		else if (matchResult.error) setReviewError(matchResult.error)
		else if (sessionResult.error) setReviewError(sessionResult.error)
		else {
			setMatches(matchResult.data ?? [])
			setSessionItems(readSessionItems(sessionResult.data))
			setPreviousLines(readPriorReceiptLines(sessionResult.data))
		}
		setReviewLoading(false)
	}, [ticketId])

	const setOpen = (next: boolean) => {
		setOpenState(next)
		if (!next) onClosed?.()
	}

	const openReview = () => {
		if (!trip) return
		setOpenState(true)
		setSubmitError(null)
		setDecisions(createReviewDecisions())
		setEditingLineId(null)
		lastAttempt.current = null
		void loadReview(trip, ticket)
	}

	/** Closing sends nothing: the receipt stays unattached and the trip unchanged. */
	const closeReview = () => setOpen(false)

	const review = useMemo(() => trip && ticket ? buildAttachReview({
		candidate: trip,
		lines: ticket.lines,
		matches,
		sessionItems,
		receiptStore: ticket.receiptStore,
		totalAmount: totalInput.trim() === '' ? null : Number(totalInput),
		decisions,
		previousLines,
		coveredItemIds: new Set(previousLines.flatMap(line => line.shopping_session_item_id ? [line.shopping_session_item_id] : [])),
	}) : null, [trip, ticket, matches, sessionItems, totalInput, decisions, previousLines])
	const totalIsValid = totalInput.trim() === '' || (Number.isFinite(Number(totalInput)) && Number(totalInput) >= 0)
	const phase = getTripReviewPhase({ open, loading: reviewLoading, failed: reviewError !== null, hasReview: review !== null })

	const setDecision = (lineId: string, decision: LineDecision) => {
		const line = ticket?.lines.find(candidate => candidate.id === lineId)
		if (!line) return
		setDecisions(current => changeReviewDecision(current, line, matches.find(match => match.ticket_item_id === lineId), decision))
		setEditingLineId(null)
	}

	const submit = async (completeSession = true, retry = false) => {
		if (!trip || !review || requestInFlight.current || !totalIsValid) return
		const payload = retry ? lastAttempt.current : { ...review.payload, complete_session: completeSession }
		if (!payload) return
		lastAttempt.current = payload
		requestInFlight.current = true
		setSubmitting(true)
		setSubmitError(null)
		const result = await attachTicketToSession(ticketId, payload)
		requestInFlight.current = false
		setSubmitting(false)
		if (result.error) {
			const reason = result.details && typeof result.details === 'object' && 'reason' in result.details
				? result.details.reason : null
			setSubmitError({ message: result.error, attached: reason === 'RECEIPT_ATTACHED' })
			if (reason === 'RECEIPT_ATTACHED') onAlreadyAttached?.()
			return
		}
		const notice = describeAttachSuccess(result.data)
		toast.success(notice.title, { description: notice.description })
		setOpen(false)
		onAttached(trip)
	}

	return {
		trip, lines: ticket?.lines ?? [], receiptStore: ticket?.receiptStore ?? null,
		open, setOpen, openReview, closeReview, phase,
		sessionItems, matches, reviewLoading, reviewError,
		retryReview: () => trip && void loadReview(trip, ticket),
		decisions, setDecision, editingLineId, setEditingLineId,
		retrySubmit: () => submit(true, true),
		totalInput, setTotalInput, totalIsValid, submitting, submitError, submit, review,
	}
}

export type TripReview = ReturnType<typeof useTripReview>
