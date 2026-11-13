'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ConfirmSheet } from '@/components/commons'
import { cancelShoppingSession } from '@/lib/api/endpoints'
import { useActiveSessionStore } from '@/stores/active-session'
import { useTripSync } from './hooks/use-trip-sync'

interface CancelSessionSheetProps {
	sessionId: string
	listName: string
	checked: number
	total: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

/** "Cancel Shopping?": discards the running session. It never reaches the history and cannot be undone, and the sheet says so. */
export function CancelSessionSheet({ sessionId, listName, checked, total, open, onOpenChange }: CancelSessionSheetProps) {
	const [loading, setLoading] = useState(false)
	const { controller } = useTripSync(sessionId)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	const handleCancel = async () => {
		setLoading(true)
		try {
			const { error } = await cancelShoppingSession(sessionId)
			if (error) throw new Error(error)
			controller?.receive([], false)
			// Clear store optimistically
			clearActiveSession(sessionId)
			router.push('/dashboard')
		} catch (err) {
			console.error('Failed to cancel session:', err)
			toast.error('Failed to cancel the shopping session')
			setLoading(false)
			onOpenChange(false)
		}
	}

	return (
		<ConfirmSheet
			open={open}
			onOpenChange={onOpenChange}
			title='Cancel Shopping?'
			description={`You have collected ${checked} of ${total} items. Checks are discarded.`}
			consequenceTitle={`${listName} stays as it was`}
			consequence='Nothing from this trip is saved to your history.'
			consequenceTone='warning'
			cancelLabel='Keep Shopping'
			confirmLabel='Cancel Shopping'
			loadingLabel='Cancelling…'
			tone='danger'
			loading={loading}
			onConfirm={handleCancel}
			testId='cancel-session-sheet'
		/>
	)
}
