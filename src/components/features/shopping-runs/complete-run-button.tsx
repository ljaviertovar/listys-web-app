'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { completeShoppingRun } from '@/actions/shopping-runs'

interface Props {
	runId: string
}

export function CompleteRunButton({ runId }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const router = useRouter()

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingRun(runId, {
				sync_to_base: syncToBase,
			})
			if (error) throw new Error(error)
			setOpen(false)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete run:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					disabled={loading}
					size='sm'
					variant={'ghost'}
					className='flex-1'
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Complete Shopping
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Complete Shopping Run?</DialogTitle>
					<DialogDescription>You've checked all items. Would you like to complete this shopping run?</DialogDescription>
				</DialogHeader>

				<div className='py-4'>
					<div className='flex items-start space-x-3 rounded-lg border p-4'>
						<Checkbox
							id='sync-to-base'
							checked={syncToBase}
							onCheckedChange={val => setSyncToBase(val as boolean)}
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

				<DialogFooter className='w-full flex-row gap-4'>
					<Button
						variant='outline'
						onClick={handleComplete}
						disabled={loading}
						className='flex-1'
					>
						{loading ? 'Completing...' : 'Complete Shopping'}
					</Button>
					<Button
						onClick={() => setOpen(false)}
						disabled={loading}
						className='flex-1'
					>
						Keep Shopping
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
