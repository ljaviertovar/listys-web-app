'use client'

import { useState, type DragEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Upload06Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

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
			<Button
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
				variant='dropzone'
				size='block'
				rounded='3xl'
				data-dragging={dragging}
				className='size-full min-h-[172px]'
			>
				<span className='flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
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
			</Button>
			<UploadTicketDialog
				trigger={null}
				open={open}
				onOpenChange={setOpen}
				initialFiles={dropped}
			/>
		</>
	)
}
