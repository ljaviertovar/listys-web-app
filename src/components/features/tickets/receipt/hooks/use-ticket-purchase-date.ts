'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { updateTicketPurchaseDate } from '@/lib/api/endpoints'

import { describeSavedDay, purchaseDayProblem } from '../helpers/purchase-date'

/** Typing a date fires a change for every valid in-between value, so a day is saved once the person pauses on it. */
const SAVE_DELAY_MS = 700
const SAVE_FAILED = 'We couldn’t save the date. Check your connection and try again.'

/**
 * The purchase date field: choosing a day saves it (there is no Save button) and the field keeps what the person picked while
 * it saves and when saving fails, so Try Again sends the same day. `shownDay` is the day the receipt counts under today (the
 * date read from it, or its upload date) and `today` is the person's own today.
 */
export function useTicketPurchaseDate({ ticketId, shownDay, today, countsInSpending }: {
	ticketId: string
	shownDay: string
	today: string
	countsInSpending: boolean
}) {
	const router = useRouter()
	const [saving, startSaving] = useTransition()
	// The draft belongs to the day it was made against: once the receipt carries another day, the draft is stale.
	const [draft, setDraft] = useState<{ day: string; base: string } | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [failedDay, setFailedDay] = useState<string | null>(null)
	const [savedMessage, setSavedMessage] = useState<string | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingDay = useRef<string | null>(null)

	const value = draft && draft.base === shownDay ? draft.day : shownDay

	const save = useCallback((day: string) => {
		const problem = purchaseDayProblem(day, today)
		if (problem) {
			setError(problem)
			return
		}
		setError(null)
		setFailedDay(null)
		startSaving(async () => {
			try {
				const result = await updateTicketPurchaseDate(ticketId, day)
				if (result.error || !result.data) {
					setError(SAVE_FAILED)
					setFailedDay(day)
					return
				}
				setSavedMessage(describeSavedDay({ savedDay: day, previousDay: shownDay, countsInSpending, currentYear: Number(today.slice(0, 4)) }))
				router.refresh()
			} catch {
				setError(SAVE_FAILED)
				setFailedDay(day)
			}
		})
	}, [countsInSpending, router, shownDay, ticketId, today])

	const clearTimer = () => {
		if (timer.current) clearTimeout(timer.current)
		timer.current = null
	}

	const choose = (day: string) => {
		// An empty value is a date being retyped; nothing to save yet.
		if (!day) return
		setDraft({ day, base: shownDay })
		setError(null)
		setFailedDay(null)
		setSavedMessage(null)
		pendingDay.current = day
		clearTimer()
		timer.current = setTimeout(() => {
			pendingDay.current = null
			if (day !== shownDay) save(day)
		}, SAVE_DELAY_MS)
	}

	/** Leaving the field saves a day that is still waiting for the pause. */
	const flush = () => {
		const day = pendingDay.current
		if (!day) return
		clearTimer()
		pendingDay.current = null
		if (day !== shownDay) save(day)
	}

	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	return {
		value,
		saving,
		error,
		savedMessage,
		canRetry: failedDay !== null,
		choose,
		flush,
		retry: () => {
			if (failedDay) save(failedDay)
		},
	}
}
