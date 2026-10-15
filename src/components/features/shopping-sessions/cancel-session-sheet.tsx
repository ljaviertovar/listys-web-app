'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ConfirmSheet } from '@/components/commons'
import { cancelShoppingSession } from '@/lib/api/endpoints'
import { useActiveSessionStore } from '@/stores/active-session'

interface CancelSessionSheetProps {
	sessionId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

/** "Cancel Shopping?": discards the running session. It never reaches the history and cannot be undone, and the sheet says so. */
export function CancelSessionSheet({ sessionId, open, onOpenChange }: CancelSessionSheetProps) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	const handleCancel = async () => {
		setLoading(true)
		try {
			const { error } = await cancelShoppingSession(sessionId)
			if (error) throw new Error(error)
			// Clear store optimistically
			clearActiveSession()
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
			consequence='This discards the session entirely. It won’t be saved to your history and it can’t be undone.'
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
