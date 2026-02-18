'use client'

import { useEffect, useRef, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { completeShoppingSession } from '@/lib/api/endpoints/shopping-sessions'
import { useActiveSessionStore } from '@/stores/active-session'

interface Props {
	title: string
	description: string
	sessionId: string
	progress: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CompleteSessionAlert({ title, description, sessionId, progress, open, onOpenChange }: Props) {
	const [loading, setLoading] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	// Auto-open solo cuando el progreso pasa de <100 a 100 (evita reabrir al cerrar)
	const prevProgressRef = useRef<number>(progress)

	useEffect(() => {
		if (progress === 100 && prevProgressRef.current < 100) {
			onOpenChange(true)
		}
		prevProgressRef.current = progress
	}, [progress, onOpenChange])

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingSession(sessionId, {
				sync_to_base: syncToBase,
			})
			if (error) throw new Error(error)
			// Clear store optimistically
			clearActiveSession()
			onOpenChange(false)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete session:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<div className='py-4'>
					<div className='flex items-start space-x-3 rounded-lg border p-4'>
						<Checkbox
							id='sync-to-base'
							checked={syncToBase}
							onCheckedChange={checked => setSyncToBase(checked as boolean)}
							disabled={loading}
						/>
						<div className='flex-1 space-y-1'>
							<Label
								htmlFor='sync-to-base'
								className='text-sm font-medium leading-none cursor-pointer'
							>
								Sync changes back to base list
							</Label>
							<p className='text-xs text-muted-foreground'>
								Updates quantities and adds new items you created during shopping to your original base list.
							</p>
						</div>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Continue Shopping</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleComplete}
						disabled={loading}
					>
						{loading ? 'Completing...' : 'Complete Session'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
