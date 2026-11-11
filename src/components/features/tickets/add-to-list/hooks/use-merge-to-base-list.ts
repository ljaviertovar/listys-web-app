'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { buildListDisplayNames } from '@/utils'

import { loadMergeListTargets, modeForListCount, submitTicketItemsToList, type BaseList, type MergeMode } from '../helpers/merge-ticket-items'
import type { ScreenDecisions } from '../helpers/merge-review'
import type { MergeOutcome } from '../merge-result-sheet'
import { useMergeReview } from './use-merge-review'

interface UseMergeToBaseListInput {
	open: boolean
	defaultBaseListId?: string | null
	ticketId: string
	selectedItemIds: string[]
	/** The receipt's lines, so the review step can name them. */
	lines: Array<{ id: string; name: string }>
	/** Matches already decided on the receipt screen; Review Matches starts from them when it is adding to the same list. */
	initialDecisions?: ScreenDecisions | null
	onOpenChange: (open: boolean) => void
	onSuccess: (baseListId: string) => void
	onReceiptAttached?: (sessionId: string) => void
	/** True from the moment the lines are sent until the answer arrives; the sheet is already closed then, so the screen shows it. */
	onSavingChange?: (saving: boolean) => void
}

/** `choose` picks the list (or names a new one); `review` decides how lines without a same-name item are added. */
export type MergeStep = 'choose' | 'review'

export function useMergeToBaseList({ open, defaultBaseListId, ticketId, selectedItemIds, lines, initialDecisions, onOpenChange, onSuccess, onReceiptAttached, onSavingChange }: UseMergeToBaseListInput) {
	const [mode, setMode] = useState<MergeMode>('existing')
	const [baseLists, setBaseLists] = useState<BaseList[]>([])
	const [selectedBaseListId, setSelectedBaseListId] = useState('')
	const [newListName, setNewListName] = useState('')
	const [loading, setLoading] = useState(false)
	const [loaded, setLoaded] = useState(false)
	const [loadFailed, setLoadFailed] = useState(false)
	// Bumped by "Try Again" so the effect below reads the lists once more.
	const [attempt, setAttempt] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const [step, setStep] = useState<MergeStep>('choose')
	const [wasOpen, setWasOpen] = useState(open)
	const [outcome, setOutcome] = useState<MergeOutcome | null>(null)
	// What "Try Again" sends once more: the links of the last attempt.
	const lastLinks = useRef<ReturnType<typeof useMergeReview>['links'] | undefined>(undefined)
	const review = useMergeReview()

	// Every opening starts at the list choice (state adjusted during render, not in an effect).
	if (open !== wasOpen) {
		setWasOpen(open)
		if (open) {
			setStep('choose')
			review.reset()
		}
	}

	// Lists that share a name read "Weekly" and "Weekly (2)" so the user can tell them apart.
	const listLabels = useMemo(() => buildListDisplayNames(baseLists), [baseLists])

	// The state is only set once the request answers, never while the effect runs, so opening the dialog costs no extra render.
	useEffect(() => {
		if (!open) return
		let cancelled = false

		loadMergeListTargets()
			.then(targets => {
				if (cancelled) return
				setBaseLists(targets.baseLists)
				setSelectedBaseListId(current => {
					if (current && targets.baseLists.some(list => list.id === current)) return current
					return defaultBaseListId && targets.baseLists.some(list => list.id === defaultBaseListId) ? defaultBaseListId : ''
				})
				setMode(current => modeForListCount(targets.baseLists.length, current))
				setLoadFailed(false)
				setError(null)
				setLoaded(true)
			})
			.catch(() => {
				if (cancelled) return
				setLoadFailed(true)
				setError('We couldn’t load your lists. Close this window and try again.')
			})

		return () => {
			cancelled = true
		}
	}, [open, attempt, defaultBaseListId])

	const loadData = () => {
		setLoadFailed(false)
		setLoaded(false)
		setError(null)
		setAttempt(current => current + 1)
	}

	const loadingData = open && !loaded && !loadFailed

	const backToChoose = () => {
		setStep('choose')
		setError(null)
		review.reset()
	}

	const targetListName = mode === 'new' ? newListName.trim() : listLabels.get(selectedBaseListId) ?? baseLists.find(list => list.id === selectedBaseListId)?.name ?? ''

	// The choice sheet closes as soon as the lines are sent: the receipt's bar says "Saving…", and the answer comes back as a sheet over the receipt.
	const submit = async (links?: ReturnType<typeof useMergeReview>['links']) => {
		lastLinks.current = links
		const itemCount = selectedItemIds.length
		const listName = targetListName
		setOutcome(null)
		onOpenChange(false)
		onSavingChange?.(true)

		try {
			const result = await submitTicketItemsToList({
				mode,
				ticketId,
				selectedItemIds,
				selectedBaseListId,
				newListName,
				links,
			})

			if (result.kind === 'invalid' || result.kind === 'error') {
				setOutcome({ kind: 'failed', listName, itemCount, message: result.message })
				return
			}
			if (result.kind === 'attached') {
				onReceiptAttached?.(result.sessionId)
				return
			}

			if (result.kind === 'merged') {
				toast.success(`Receipt saved to ${listName}`)
				setOutcome({ kind: 'saved', baseListId: result.baseListId, listName, itemCount, counts: result.counts ?? null })
			} else {
				toast.success(`List created with ${result.itemCount} ${result.itemCount === 1 ? 'item' : 'items'}`)
				setOutcome({ kind: 'saved', baseListId: result.baseListId, listName, itemCount, counts: { added: result.itemCount, updated: 0, skipped: 0 } })
			}

			onSuccess(result.baseListId)
		} finally {
			onSavingChange?.(false)
		}
	}

	const retry = () => submit(lastLinks.current)

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (loading) return
		setError(null)
		setLoading(true)

		try {
			if (mode === 'existing' && step === 'choose') {
				if (!selectedBaseListId) {
					setError('Choose a shopping list.')
					return
				}

				// Remembered links and new lines are always shown before anything is added; lines that all match by name skip the step.
				const checked = await review.load({ ticketId, baseListId: selectedBaseListId, lines, selectedIds: selectedItemIds, initialDecisions })
				if (!checked) {
					setError('We couldn’t check your list. Try again.')
					return
				}
				if (checked.needsReview) {
					setStep('review')
					return
				}
				await submit()
				return
			}

			await submit(mode === 'existing' ? review.links : undefined)
		} finally {
			setLoading(false)
		}
	}

	return {
		mode,
		setMode,
		baseLists,
		listLabels,
		selectedBaseListId,
		setSelectedBaseListId,
		newListName,
		setNewListName,
		loading,
		loadingData,
		loadFailed,
		error,
		setError,
		loadData,
		handleSubmit,
		step,
		backToChoose,
		review,
		outcome,
		dismissOutcome: () => setOutcome(null),
		retry,
	}
}
