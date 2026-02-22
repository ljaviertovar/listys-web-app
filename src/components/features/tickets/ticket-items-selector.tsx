'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { PackageSearch } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { MergeToBaseListDialog } from './merge-to-base-list-dialog'
import { TicketProcessingError } from './ticket-processing-error'
import { TicketItemRow } from './ticket-item-row'
import { Loading03Icon, Add01Icon } from '@hugeicons/core-free-icons'
import { getCategoryWithEmoji, normalizeCategory } from '@/data/constants'

import type { TicketItem } from '@/features/tickets/types'

interface Props {
	ticketId: string
	items: TicketItem[]
	status: 'pending' | 'processing' | 'failed' | 'completed'
	ocrError?: string | null
}

export function TicketItemsSelector({ ticketId, items, status, ocrError }: Props) {
	const router = useRouter()
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
	const [showMergeDialog, setShowMergeDialog] = useState(false)

	// Polling removed — TicketStatusListener handles refresh on status change

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

	const handleMergeSuccess = (baseListId: string) => {
		setShowMergeDialog(false)
		setSelectedItems(new Set())
		if (baseListId) {
			router.push(`/base-lists/${baseListId}/edit`)
		} else {
			router.refresh()
		}
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
			<div className='py-6'>
				<div className='mx-auto flex max-w-md flex-col items-center rounded-2xl border-primary/30 bg-gradient-to-b from-primary/5 to-background px-6 py-8 text-center'>
					<div className='flex h-14 w-14 items-center justify-center text-primary'>
						<PackageSearch className='h-10 w-10' />
					</div>
					<p className='mt-1 text-base font-semibold text-foreground'>No items detected</p>
					<p className='mt-1 text-sm text-muted-foreground'>
						We could not find products in this receipt image. Try with a clearer photo and good lighting.
					</p>
				</div>
			</div>
		)
	}

	const allSelected = selectedItems.size === items.length
	const someSelected = selectedItems.size > 0
	const canMerge = status === 'completed'

	const groupedItems = items.reduce(
		(acc, item) => {
			const normalizedCategory = normalizeCategory(item.category || '')
			const key = normalizedCategory || 'Other'
			if (!acc[key]) acc[key] = []
			acc[key].push(item)
			return acc
		},
		{} as Record<string, TicketItem[]>,
	)

	const categorySections = Object.entries(groupedItems)
		.sort(([a], [b]) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
		.map(([category, sectionItems]) => ({
			key: category,
			title: getCategoryWithEmoji(category),
			items: sectionItems,
		}))

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
							className='mt-0.5 w-5 h-5 rounded-lg'
						/>
						<span className='text-sm text-muted-foreground'>
							{selectedItems.size === 0
								? 'Select all items to add to a list'
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
								className='h-4 w-4'
							/>
							Add to List
						</Button>
					)}
				</div>
			)}

			{/* Items grouped by category */}
			<div className='space-y-4'>
				{categorySections.map(section => (
					<section
						key={section.key}
						className='mb-8'
					>
						<div className='mb-2 flex items-center justify-between'>
							<div className='min-w-0 flex-1'>
								<p className='text-base font-bold tracking-tight uppercase'>{section.title}</p>
								<div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70'>
									<span>
										{section.items.length} {section.items.length === 1 ? 'item' : 'items'}
									</span>
								</div>
							</div>
						</div>
						<div className='space-y-2'>
							{section.items.map(item => (
								<TicketItemRow
									key={item.id}
									item={item}
									canSelect={canMerge}
									selected={selectedItems.has(item.id)}
									onSelectToggle={() => toggleItem(item.id)}
								/>
							))}
						</div>
					</section>
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
