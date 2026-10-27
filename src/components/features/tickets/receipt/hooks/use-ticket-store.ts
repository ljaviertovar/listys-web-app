'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { StorePick } from '@/components/features/stores'

import { assignStore, createAndAssignStore, type StoreActionResult } from '../helpers/ticket-store-actions'

type PendingAction = 'confirm' | 'save' | 'pick' | 'remove' | 'retry'

const REUSED_MESSAGE = 'That store was already in My Stores, so the receipt uses it'

/**
 * Confirming, saving, choosing and removing the receipt's store. Only one runs at a time, and the card stays busy until the
 * page has been read again (the transition covers the refresh), so it never shows the old state with live buttons. When a
 * new store was created but could not be put on the receipt, a retry only assigns it, so no second store is created.
 */
export function useTicketStore(ticketId: string) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [action, setAction] = useState<PendingAction | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [retryStoreId, setRetryStoreId] = useState<string | null>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [saveOpen, setSaveOpen] = useState(false)

	const run = (next: PendingAction, task: () => Promise<StoreActionResult>, success: string) => {
		if (isPending) return
		setAction(next)
		setError(null)

		startTransition(async () => {
			const result = await task()

			if (result.kind === 'error') {
				setError(result.message)
				return
			}

			// The store is saved either way, so the dialog that asked for it has done its job.
			setPickerOpen(false)
			setSaveOpen(false)

			if (result.kind === 'assign-failed') {
				setRetryStoreId(result.storeId)
				setError(result.message)
				return
			}

			setRetryStoreId(null)
			toast.success(result.reused ? REUSED_MESSAGE : success)
			router.refresh()
		})
	}

	const openPicker = () => {
		setError(null)
		setPickerOpen(true)
	}

	const openSave = () => {
		setError(null)
		setSaveOpen(true)
	}

	const closeDialogs = () => {
		setPickerOpen(false)
		setSaveOpen(false)
		setError(null)
	}

	return {
		pending: isPending ? action : null,
		error,
		canRetry: retryStoreId !== null,
		pickerOpen,
		saveOpen,
		openPicker,
		openSave,
		closeDialogs,
		confirm: (storeId: string) => run('confirm', () => assignStore(ticketId, storeId), 'Store confirmed'),
		saveNew: (name: string) => run('save', () => createAndAssignStore(ticketId, name), 'Store saved'),
		pick: (choice: StorePick) =>
			run(
				'pick',
				() => (choice.kind === 'existing' ? assignStore(ticketId, choice.store.id) : createAndAssignStore(ticketId, choice.name)),
				choice.kind === 'existing' ? 'Store updated' : 'Store saved',
			),
		remove: () => run('remove', () => assignStore(ticketId, null), 'Store removed from this receipt'),
		retry: () => (retryStoreId ? run('retry', () => assignStore(ticketId, retryStoreId), 'Store saved') : undefined),
	}
}
