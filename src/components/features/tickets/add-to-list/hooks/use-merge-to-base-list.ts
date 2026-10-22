'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { loadMergeListTargets, submitTicketItemsToList, type MergeMode } from '../helpers/merge-ticket-items'

interface UseMergeToBaseListInput {
	open: boolean
	ticketId: string
	selectedItemIds: string[]
	onOpenChange: (open: boolean) => void
	onSuccess: (baseListId: string) => void
}

export function useMergeToBaseList({ open, ticketId, selectedItemIds, onOpenChange, onSuccess }: UseMergeToBaseListInput) {
	const [mode, setMode] = useState<MergeMode>('existing')
	const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
	const [baseLists, setBaseLists] = useState<{ id: string; name: string; group_id: string }[]>([])
	const [selectedGroupId, setSelectedGroupId] = useState('')
	const [selectedBaseListId, setSelectedBaseListId] = useState('')
	const [newListName, setNewListName] = useState('')
	const [loading, setLoading] = useState(false)
	const [loadingData, setLoadingData] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const loadData = useCallback(async () => {
		setLoadingData(true)
		setError(null)
		try {
			const targets = await loadMergeListTargets()
			setGroups(targets.groups)
			setBaseLists(targets.baseLists)
			if (targets.groups.length > 0) setSelectedGroupId(current => current || targets.groups[0].id)
		} catch {
			setError('We couldn’t load your groups and lists. Close this window and try again.')
		} finally {
			setLoadingData(false)
		}
	}, [])

	useEffect(() => {
		if (open) void loadData()
	}, [open, loadData])

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
				selectedGroupId,
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
		groups,
		baseLists,
		selectedGroupId,
		setSelectedGroupId,
		selectedBaseListId,
		setSelectedBaseListId,
		newListName,
		setNewListName,
		loading,
		loadingData,
		error,
		setError,
		loadData,
		handleSubmit,
	}
}
