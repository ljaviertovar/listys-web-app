'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MergeToBaseListDialog } from './merge-to-base-list-dialog'
import { TicketProcessingError } from './ticket-processing-error'
import { Loading03Icon, Add01Icon } from '@hugeicons/core-free-icons'

import type { TicketItem } from '@/features/tickets/types'

interface Props {
	ticketId: string
	items: TicketItem[]
	status: 'pending' | 'processing' | 'failed' | 'completed'
	isMerged?: boolean
	ocrError?: string | null
}

export function TicketItemsSelector({ ticketId, items, status, isMerged, ocrError }: Props) {
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
		return <TicketProcessingError error={ocrError} />
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
	const canMerge = status === 'completed' && !isMerged

	return (
		<div className='space-y-4'>
			{/* Selection controls */}
			{canMerge && (
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
						{canMerge && (
							<Checkbox
								checked={selectedItems.has(item.id)}
								onCheckedChange={() => toggleItem(item.id)}
								aria-label={`Select ${item.name}`}
							/>
						)}
						<div className='flex-1'>
							<p className='font-bold mb-1'>{item.name}</p>
							<div className='flex items-center gap-2'>
								{item.category && <Badge variant='outline'>{item.category}</Badge>}
							</div>
						</div>
						<span>
							{item.quantity || 1} {item.unit || 'pcs'}
						</span>
					</div>
				))}
			</div>

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
