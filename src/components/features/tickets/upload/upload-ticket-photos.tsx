'use client'

import { useRef, type ChangeEvent, type DragEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Alert02Icon, Cancel01Icon, Loading03Icon, Upload06Icon } from '@hugeicons/core-free-icons'

import { MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'
import { Button } from '@/components/ui/button'

import { rejectionMessage } from './helpers/classify-photo'
import type { PhotoPreview, PhotoRejection } from './hooks/use-photo-picker'

interface Props {
	previews: PhotoPreview[]
	rejections: PhotoRejection[]
	max: number
	/** Photos are on their way: they stop being editable and show that they are being sent. */
	uploading: boolean
	onAdd: (files: FileList | File[]) => void
	onRemove: (id: string) => void
	onDismissRejection: (id: string) => void
}

/** The photo field of the upload form: the way in (click or drop), the photos chosen, and what was left out and why. */
export function UploadTicketPhotos({ previews, rejections, max, uploading, onAdd, onRemove, onDismissRejection }: Props) {
	const inputRef = useRef<HTMLInputElement>(null)
	const hasPhotos = previews.length > 0
	const full = previews.length >= max

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) onAdd(event.target.files)
		// Choosing the same file again has to fire a change.
		event.target.value = ''
	}

	const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault()
		if (event.dataTransfer.files.length > 0) onAdd(event.dataTransfer.files)
	}

	return (
		<div
			data-testid='upload-ticket-photos'
			className='flex flex-col gap-3'
		>
			{hasPhotos ? (
				<ul className='grid grid-cols-3 gap-3'>
					{previews.map((photo, index) => (
						<li
							key={photo.id}
							className='relative aspect-[3/4]'
						>
							<div className='size-full overflow-hidden rounded-xl bg-slate-100 dark:bg-muted'>
								{/* eslint-disable-next-line @next/next/no-img-element -- a local object URL preview */}
								<img
									src={photo.url}
									alt={`Receipt photo ${index + 1}`}
									className='size-full object-cover'
								/>
							</div>
							{uploading ? (
								<span
									aria-hidden='true'
									className='absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/45 text-white'
								>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='size-6 animate-spin motion-reduce:animate-none'
									/>
								</span>
							) : (
								<button
									type='button'
									onClick={() => onRemove(photo.id)}
									title='Remove Image'
									aria-label={`Remove photo ${index + 1}`}
									className='absolute -top-3 -right-3 flex size-11 items-center justify-center rounded-full focus-visible:outline-none [&:focus-visible>span]:ring-2 [&:focus-visible>span]:ring-blue-500'
								>
									<span className='flex size-6 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white'>
										<HugeiconsIcon
											icon={Cancel01Icon}
											strokeWidth={2.5}
											className='size-3'
										/>
									</span>
								</button>
							)}
						</li>
					))}
					{!full && !uploading ? (
						<li className='aspect-[3/4]'>
							<Button
								type='button'
								onClick={() => inputRef.current?.click()}
								onDrop={handleDrop}
								onDragOver={event => event.preventDefault()}
								variant='dropzone'
								size='block'
								rounded='2xl'
								className='h-full w-full'
							>
								<HugeiconsIcon
									icon={Add01Icon}
									strokeWidth={1.8}
									className='size-5'
								/>
								Add More
							</Button>
						</li>
					) : null}
				</ul>
			) : (
				<Button
					type='button'
					onClick={() => inputRef.current?.click()}
					onDrop={handleDrop}
					onDragOver={event => event.preventDefault()}
					variant='dropzone'
					size='block'
					rounded='2xl'
					className='min-h-36 w-full'
				>
					<span className='flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
						<HugeiconsIcon
							icon={Upload06Icon}
							strokeWidth={1.8}
							className='size-5'
						/>
					</span>
					<span className='font-display text-sm font-semibold text-slate-900 sm:hidden dark:text-foreground'>
						<span className='text-blue-700 dark:text-blue-400'>Choose Photos</span>
					</span>
					<span className='hidden flex-col items-center gap-0.5 sm:flex'>
						<span className='font-display text-sm font-semibold text-slate-900 dark:text-foreground'>Drag and drop photos here</span>
						<span className='font-display text-sm font-semibold text-blue-700 dark:text-blue-400'>or Choose Photos</span>
					</span>
					<span className='max-w-[26ch] text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
						Up to {max} photos · PNG or JPG (no HEIC) · {MAX_TICKET_IMAGE_MB} MB each
					</span>
				</Button>
			)}

			{rejections.map(rejection => {
				const message = rejectionMessage(rejection.name, rejection.reason)
				return (
					<div
						key={rejection.id}
						role='alert'
						data-testid='upload-ticket-rejection'
						className='flex items-start gap-2.5 rounded-xl bg-red-50 py-3 pr-1.5 pl-3 text-red-900 dark:bg-red-950/60 dark:text-red-200'
					>
						<HugeiconsIcon
							icon={Alert02Icon}
							strokeWidth={1.8}
							className='mt-0.5 size-4.5 shrink-0 text-red-700 dark:text-red-400'
						/>
						<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
							<span className='font-mono text-xs leading-snug font-semibold break-all'>{message.title}</span>
							<span className='text-xs leading-snug'>{message.hint}</span>
						</div>
						<Button
							type='button'
							onClick={() => onDismissRejection(rejection.id)}
							aria-label={`Dismiss message about ${rejection.name}`}
							variant='destructive-ghost'
							size='icon-xl'
							className='shrink-0'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={1.8}
								className='size-4'
							/>
						</Button>
					</div>
				)
			})}

			<input
				ref={inputRef}
				type='file'
				accept='image/png,image/jpeg'
				multiple
				onChange={handleChange}
				className='hidden'
				aria-label='Upload receipt images'
			/>
		</div>
	)
}
