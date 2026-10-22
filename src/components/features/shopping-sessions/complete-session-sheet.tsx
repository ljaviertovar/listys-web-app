'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmSheet } from '@/components/commons'
import { completeShoppingSession } from '@/lib/api/endpoints'
import { useActiveSessionStore } from '@/stores/active-session'

interface CompleteSessionSheetProps {
	sessionId: string
	checked: number
	total: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Completing a shopping session. With items still unticked it says how many, so the user can go back; with all of them
 * ticked it offers to save the trip. Either way it asks whether to sync the changes back to the base list (on by default).
 */
export function CompleteSessionSheet({ sessionId, checked, total, open, onOpenChange }: CompleteSessionSheetProps) {
	const syncId = useId()
	const [loading, setLoading] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	const progress = total > 0 ? Math.round((checked / total) * 100) : 0
	const unchecked = total - checked
	const allChecked = total > 0 && unchecked === 0

	// Opens by itself once, when the last item gets ticked (progress goes from below 100 to 100); closing it does not reopen it.
	const previousProgress = useRef(progress)
	useEffect(() => {
		if (progress === 100 && previousProgress.current < 100) onOpenChange(true)
		previousProgress.current = progress
	}, [progress, onOpenChange])

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingSession(sessionId, { sync_to_base: syncToBase })
			if (error) throw new Error(error)
			// Clear store optimistically
			clearActiveSession()
			onOpenChange(false)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete session:', err)
			toast.error('Failed to complete the shopping session')
		} finally {
			setLoading(false)
		}
	}

	return (
		<ConfirmSheet
			open={open}
			onOpenChange={onOpenChange}
			title={allChecked ? 'Ready to Complete Shopping?' : 'Complete Shopping?'}
			media={
				allChecked ? (
					<span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'>
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							strokeWidth={1.5}
							aria-hidden='true'
							className='size-6'
						/>
					</span>
				) : undefined
			}
			description={
				allChecked ? (
					'All items are checked. Complete shopping to save this session to your history.'
				) : (
					<>
						<b className='font-mono font-semibold text-foreground'>{unchecked}</b> {unchecked === 1 ? 'item is' : 'items are'} still unchecked. Complete shopping and save the items you collected to your history?
					</>
				)
			}
			cancelLabel='Continue Shopping'
			confirmLabel='Complete Shopping'
			loadingLabel='Completing Shopping…'
			loading={loading}
			onConfirm={handleComplete}
			testId='complete-session-sheet'
		>
			<label
				htmlFor={syncId}
				data-testid='complete-session-sync'
				className='flex cursor-pointer items-start gap-1 rounded-2xl bg-muted py-1 pr-3.5 dark:bg-muted'
			>
				<span className='flex size-11 shrink-0 items-center justify-center'>
					<Checkbox
						id={syncId}
						checked={syncToBase}
						onCheckedChange={value => setSyncToBase(value === true)}
						disabled={loading}
						size='lg'
					/>
				</span>
				<span className='flex flex-col gap-1 pt-2.5 pb-2'>
					<span className='text-sm leading-[1.3] font-semibold'>Update the Base List</span>
					<span className='text-xs leading-[1.45] text-slate-500 dark:text-muted-foreground'>
						Apply this session’s changes to your reusable list.
					</span>
				</span>
			</label>
		</ConfirmSheet>
	)
}
