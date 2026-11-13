'use client'

import { type ChangeEvent, type DragEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Cancel01Icon, Upload06Icon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'
import { Button } from '@/components/ui/button'

import type { PhotoPreview, PhotoRejection } from './hooks/use-photo-picker'
import { UploadPhotoRows } from './upload-photo-rows'

interface Props {
	inputId: string
	descriptionId: string
	errorId?: string
	previews: PhotoPreview[]
	rejections: PhotoRejection[]
	max: number
	/** Photos are on their way: they stop being editable and show that they are being sent. */
	uploading: boolean
	onAdd: (files: FileList | File[]) => void
	onRemove: (id: string) => void
	onDismissRejection: (id: string) => void
}

/**
 * The photo field of the upload form: the way in (click or drop), the photos chosen, and what was left out and why. It is a drop
 * target while empty, a row of squares once there are photos, and a list when a photo was refused or the photos are being sent.
 */
export function UploadTicketPhotos({ inputId, descriptionId, errorId, previews, rejections, max, uploading, onAdd, onRemove, onDismissRejection }: Props) {
	const hasPhotos = previews.length > 0
	const full = previews.length >= max
	const asList = uploading || rejections.length > 0
	const describedBy = [descriptionId, errorId].filter(Boolean).join(' ')

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) onAdd(event.target.files)
		// Choosing the same file again has to fire a change.
		event.target.value = ''
	}

	const handleDrop = (event: DragEvent<HTMLElement>) => {
		event.preventDefault()
		if (event.dataTransfer.files.length > 0) onAdd(event.dataTransfer.files)
	}
	const fileInput = (
		<input
			id={inputId}
			type='file'
			accept='image/png,image/jpeg'
			multiple
			onChange={handleChange}
			className='absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0'
			aria-label='Upload receipt images'
			aria-required='true'
			aria-invalid={errorId ? true : undefined}
			aria-describedby={describedBy}
		/>
	)

	return (
		<div
			data-testid='upload-ticket-photos'
			className='flex flex-col gap-3'
		>
			<p id={descriptionId} className='sr-only'>
				Up to {max} photos · PNG or JPG (no HEIC) · {MAX_TICKET_IMAGE_MB} MB each
			</p>
			{asList ? (
				<UploadPhotoRows
					previews={previews}
					rejections={rejections}
					uploading={uploading}
					onDismissRejection={onDismissRejection}
				/>
			) : hasPhotos ? (
				<ul className='flex flex-wrap gap-3 pt-1.5'>
					{previews.map((photo, index) => (
						<li
							key={photo.id}
							className='relative size-22'
						>
							<div className='size-full overflow-hidden rounded-2xl bg-linear-to-br from-slate-200 to-slate-300 dark:bg-muted'>
								{/* eslint-disable-next-line @next/next/no-img-element -- a local object URL preview */}
								<img
									src={photo.url}
									alt={`Receipt photo ${index + 1}`}
									className='size-full object-cover'
								/>
							</div>
							<button
								type='button'
								onClick={() => onRemove(photo.id)}
								title='Remove Image'
								aria-label={`Remove photo ${index + 1}`}
								className='absolute -top-2.25 -right-2.25 flex size-11 items-start justify-end p-0.75 focus-visible:outline-none [&:focus-visible>span]:ring-2 [&:focus-visible>span]:ring-blue-500'
							>
								<span className='flex size-6 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white'>
									<HugeiconsIcon
										icon={Cancel01Icon}
										strokeWidth={2}
										className='size-3.5'
									/>
								</span>
							</button>
						</li>
					))}
					{!full ? (
						<li>
							<Button
								asChild
								onDrop={handleDrop}
								onDragOver={event => event.preventDefault()}
								variant='dropzone-quiet'
								size='tile'
								rounded='2xl'
								aria-describedby={describedBy}
							>
								<span className='relative'>
									<HugeiconsIcon
										icon={Add01Icon}
										strokeWidth={1.8}
										className='size-5'
									/>
									Add More
									{fileInput}
								</span>
							</Button>
						</li>
					) : null}
				</ul>
			) : (
				<Button
					asChild
					onDrop={handleDrop}
					onDragOver={event => event.preventDefault()}
					variant='dropzone'
					size='dropzone'
					rounded='3xl'
					aria-describedby={describedBy}
					className='w-full'
				>
					<span className='relative'>
						<RowIcon
							icon={Upload06Icon}
							tone='primary'
							size='dropzone'
							testId='upload-ticket-dropzone-icon'
						/>
						<span className='font-display text-sm leading-[1.2] font-semibold text-blue-700 sm:hidden dark:text-blue-400'>Choose Photos</span>
						<span className='hidden flex-col items-center gap-0.5 sm:flex'>
							<span className='font-display text-sm font-semibold text-foreground'>Drag and drop photos here</span>
							<span className='font-display text-sm font-semibold text-blue-700 dark:text-blue-400'>or Choose Photos</span>
						</span>
						<span className='flex max-w-65 flex-col font-sans text-xs leading-[1.45] font-normal text-muted-foreground dark:text-muted-foreground'>
							<span>Up to {max} photos · PNG or JPG (no HEIC) ·</span>
							<span>{MAX_TICKET_IMAGE_MB} MB each</span>
						</span>
						{fileInput}
					</span>
				</Button>
			)}
		</div>
	)
}
