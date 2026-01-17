'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, CheckmarkCircle02Icon, Add01Icon } from '@hugeicons/core-free-icons'
import { formatCurrency } from '@/utils/format-currency'
import { MergeToBaseListDialog } from './merge-to-base-list-dialog'
import type { TicketItem } from '@/features/tickets/types'

interface Props {
	ticketId: string
	items: TicketItem[]
	status: string
	isMerged?: boolean
}

export function TicketItemsSelector({ ticketId, items, status, isMerged }: Props) {
	const router = useRouter()
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
	const [showMergeDialog, setShowMergeDialog] = useState(false)

	// Auto-refresh while processing
	useEffect(() => {
		if (status === 'processing' || status === 'pending') {
			const timer = setTimeout(() => {
				router.refresh()
			}, 3000)

			return () => clearTimeout(timer)
		}
	}, [status, router])

	const toggleItem = (itemId: string) => {
		setSelectedItems(prev => {
			const newSet = new Set(prev)
			if (newSet.has(itemId)) {
				newSet.delete(itemId)
			} else {
				newSet.add(itemId)
			}
			return newSet
		})
	}

	const toggleAll = () => {
		if (selectedItems.size === items.length) {
			setSelectedItems(new Set())
		} else {
			setSelectedItems(new Set(items.map(item => item.id)))
		}
	}

	const handleMergeSuccess = () => {
		setShowMergeDialog(false)
		setSelectedItems(new Set())
		router.refresh()
	}

	if (status === 'pending' || status === 'processing') {
		return (
			<div className='flex flex-col items-center justify-center py-12'>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='h-12 w-12 animate-spin text-primary'
				/>
				<p className='mt-4 text-sm text-muted-foreground'>
					{status === 'pending' ? 'Waiting to process...' : 'Extracting items from receipt...'}
				</p>
			</div>
		)
	}

	if (status === 'failed') {
		return (
			<div className='py-8 text-center'>
				<p className='text-sm text-destructive'>Failed to extract items from this receipt.</p>
				<p className='mt-2 text-sm text-muted-foreground'>
					Try uploading a clearer image or contact support if the issue persists.
				</p>
			</div>
		)
	}

	if (items.length === 0) {
		return (
			<div className='py-8 text-center'>
				<p className='text-sm text-muted-foreground'>No items were found in this receipt.</p>
			</div>
		)
	}

	const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
	const allSelected = selectedItems.size === items.length
	const someSelected = selectedItems.size > 0

	return (
		<div className='space-y-4'>
			{/* Selection controls */}
			{!isMerged && (
				<div className='flex items-center justify-between border-b pb-3'>
					<div className='flex items-center gap-3'>
						<Checkbox
							checked={allSelected}
							onCheckedChange={toggleAll}
							aria-label='Select all items'
						/>
						<span className='text-sm text-muted-foreground'>
							{selectedItems.size === 0
								? 'Select items to add to a list'
								: `${selectedItems.size} of ${items.length} selected`}
						</span>
					</div>
					{someSelected && (
						<Button
							size='sm'
							onClick={() => setShowMergeDialog(true)}
						>
							<HugeiconsIcon
								icon={Add01Icon}
								strokeWidth={2}
								className='mr-2 h-4 w-4'
							/>
							Add to List
						</Button>
					)}
				</div>
			)}

			{/* Items list */}
			<div className='space-y-2'>
				{items.map(item => (
					<div
						key={item.id}
						className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
							selectedItems.has(item.id) ? 'border-primary bg-primary/5' : ''
						}`}
					>
						{!isMerged && (
							<Checkbox
								checked={selectedItems.has(item.id)}
								onCheckedChange={() => toggleItem(item.id)}
								aria-label={`Select ${item.name}`}
							/>
						)}
						<div className='flex-1'>
							<p className='font-medium'>{item.name}</p>
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<span>
									{item.quantity || 1} {item.unit || 'pcs'}
								</span>
								{item.category && (
									<>
										<span>•</span>
										<span>{item.category}</span>
									</>
								)}
							</div>
						</div>
						{item.price && <p className='font-medium'>{formatCurrency(item.price)}</p>}
					</div>
				))}
			</div>

			{/* Total */}
			{totalAmount > 0 && (
				<div className='flex items-center justify-between border-t pt-4'>
					<span className='font-semibold'>Total</span>
					<span className='text-lg font-bold'>{formatCurrency(totalAmount)}</span>
				</div>
			)}

			{/* Status indicator */}
			{isMerged ? (
				<div className='flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'>
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						strokeWidth={2}
						className='h-5 w-5'
					/>
					<span className='text-sm'>Items already added to a list</span>
				</div>
			) : (
				<div className='flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950/20 dark:text-green-400'>
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						strokeWidth={2}
						className='h-5 w-5'
					/>
					<span className='text-sm'>Items extracted successfully</span>
				</div>
			)}

			{/* Merge Dialog */}
			<MergeToBaseListDialog
				open={showMergeDialog}
				onOpenChange={setShowMergeDialog}
				ticketId={ticketId}
				selectedItemIds={Array.from(selectedItems)}
				onSuccess={handleMergeSuccess}
			/>
		</div>
	)
}
