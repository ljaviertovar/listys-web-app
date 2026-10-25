'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { buildListDisplayNames } from '@/utils'

import { loadMergeListTargets, modeForListCount, submitTicketItemsToList, type BaseList, type MergeMode } from '../helpers/merge-ticket-items'

interface UseMergeToBaseListInput {
	open: boolean
	ticketId: string
	selectedItemIds: string[]
	onOpenChange: (open: boolean) => void
	onSuccess: (baseListId: string) => void
}

export function useMergeToBaseList({ open, ticketId, selectedItemIds, onOpenChange, onSuccess }: UseMergeToBaseListInput) {
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
	}, [open, attempt])

	const loadData = () => {
		setLoadFailed(false)
		setLoaded(false)
		setError(null)
		setAttempt(current => current + 1)
	}

	const loadingData = open && !loaded && !loadFailed

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const result = await submitTicketItemsToList({
				mode,
				ticketId,
				selectedItemIds,
				selectedBaseListId,
				newListName,
			})

			if (result.kind === 'invalid' || result.kind === 'error') {
				setError(result.message)
				return
			}

			if (result.kind === 'merged') {
				toast.success('Items added to your list', result.counts ? {
					description: `${result.counts.added} added · ${result.counts.updated} updated · ${result.counts.skipped} skipped`,
				} : undefined)
			} else {
				toast.success(`List created with ${result.itemCount} ${result.itemCount === 1 ? 'item' : 'items'}`)
			}

			onOpenChange(false)
			onSuccess(result.baseListId)
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
	}
}
