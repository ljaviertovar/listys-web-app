'use client'

import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { completeShoppingRun, getShoppingRun } from '@/actions/shopping-runs'
import type { ShoppingRunItem } from '@/features/shopping-runs/types'

interface Props {
	runId: string
	items?: ShoppingRunItem[]
}

export function CompleteRunButton({ runId, items: propItems }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const [items, setItems] = useState<ShoppingRunItem[]>(propItems || [])
	const [showAllCompleteAlert, setShowAllCompleteAlert] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (!propItems) {
			const loadItems = async () => {
				const { data } = await getShoppingRun(runId)
				if (data?.items) {
					setItems(data.items)
				}
			}
			loadItems()
		}
	}, [runId, propItems])

	const areAllItemsChecked = () => {
		return items.length > 0 && items.every(item => item.checked)
	}

	const handleButtonClick = () => {
		if (areAllItemsChecked()) {
			setShowAllCompleteAlert(true)
		} else {
			setOpen(true)
		}
	}

	const handleButtonClick = () => {
		if (areAllItemsChecked()) {
			setShowAllCompleteAlert(true)
		} else {
			setOpen(true)
		}
	}

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingRun(runId, {
				sync_to_base: syncToBase,
			})
			if (error) throw new Error(error)
			setOpen(false)
			setShowAllCompleteAlert(false)				setShowAllCompleteAlert(false)			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete run:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{showAllCompleteAlert && (
				<Dialog open={showAllCompleteAlert} onOpenChange={setShowAllCompleteAlert}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>All Items Complete!</DialogTitle>
							<DialogDescription>
								You have checked all items in your shopping list. You can now complete your shopping run.
							</DialogDescription>
						</DialogHeader>
						<Alert>
							<AlertDescription>
								All {items.length} items have been checked off your list.
							</AlertDescription>
						</Alert>
						<div className='py-4'>
							<div className='flex items-start space-x-3 rounded-lg border p-4'>
								<Checkbox
									id='sync-to-base-all'
									checked={syncToBase}
									onCheckedChange={val => setSyncToBase(val as boolean)}
									disabled={loading}
								/>
								<div className='flex-1 space-y-1'>
									<Label
										htmlFor='sync-to-base-all'
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
								variant='default'
								onClick={handleComplete}
								disabled={loading}
								className='flex-1'
							>
								{loading ? 'Completing...' : 'Complete Shopping'}
							</Button>
							<Button
								onClick={() => setShowAllCompleteAlert(false)}
								disabled={loading}
								variant='outline'
								className='flex-1'
							>
								Keep Shopping
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<Button
					onClick={handleButtonClick}
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

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Complete Shopping Run?</DialogTitle>
						<DialogDescription>
							You still have unchecked items. Are you sure you want to complete this shopping run?
						</DialogDescription>
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
		</>
