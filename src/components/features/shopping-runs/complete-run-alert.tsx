'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { completeShoppingRun } from '@/actions/shopping-runs'

interface Props {
	runId: string
	progress: number
}

export function CompleteRunAlert({ runId, progress }: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (progress === 100) {
			setOpen(true)
		}
	}, [progress])

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingRun(runId, {
				sync_to_base: false,
			})
			if (error) throw new Error(error)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete run:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 All items checked!</AlertDialogTitle>
					<AlertDialogDescription>
						You've checked all items in your shopping list. Would you like to complete this shopping run?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Continue Shopping</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleComplete}
						disabled={loading}
					>
						{loading ? 'Completing...' : 'Complete Run'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
