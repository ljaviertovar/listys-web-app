'use client'

import { useState, type DragEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Upload06Icon } from '@hugeicons/core-free-icons'

import { FOCUS_RING } from '@/components/app/helpers/a1-surface'
import { cn } from '@/utils'

import { UploadTicketDialog } from './upload-ticket-dialog'

/**
 * The last cell of the receipts grid from `md`: a dashed target that opens the upload form, with the photos that were dropped on it
 * already chosen. Phones have the tab bar's raised button instead, so it is not drawn there.
 */
export function UploadAnotherTile() {
	const [open, setOpen] = useState(false)
	const [dropped, setDropped] = useState<File[]>([])
	const [dragging, setDragging] = useState(false)

	const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault()
		setDragging(false)
		const files = Array.from(event.dataTransfer.files)
		if (files.length > 0) {
			setDropped(files)
			setOpen(true)
		}
	}

	return (
		<>
			<button
				type='button'
				data-testid='upload-another-tile'
				onClick={() => {
					setDropped([])
					setOpen(true)
				}}
				onDragOver={event => {
					event.preventDefault()
					setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				className={cn(
					'flex size-full min-h-[172px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 px-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-border dark:hover:bg-muted',
					dragging && 'border-blue-500 bg-blue-50/70',
					FOCUS_RING,
				)}
			>
				<span className='flex size-11 items-center justify-center rounded-[14px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
					<HugeiconsIcon
						icon={Upload06Icon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</span>
				<span className='font-display text-base leading-normal font-semibold text-blue-700 dark:text-blue-400'>Upload Another Receipt</span>
				<span className='max-w-[26ch] text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
					Drop photos here or choose them from your computer
				</span>
			</button>
			<UploadTicketDialog
				trigger={null}
				open={open}
				onOpenChange={setOpen}
				initialFiles={dropped}
			/>
		</>
	)
}
