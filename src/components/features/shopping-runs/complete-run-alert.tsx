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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { completeShoppingRun } from '@/actions/shopping-runs'

interface Props {
	runId: string
	progress: number
}

export function CompleteRunAlert({ runId, progress }: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
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
				sync_to_base: syncToBase,
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
						{loading ? 'Completing...' : 'Complete Run'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
