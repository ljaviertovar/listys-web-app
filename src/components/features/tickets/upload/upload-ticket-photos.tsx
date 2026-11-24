'use client'

import { type ChangeEvent, type DragEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Cancel01Icon, Image01Icon, Upload06Icon } from '@hugeicons/core-free-icons'
import { ScanTextIcon } from '@hugeicons/core-free-icons-v4'

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
	/** The camera could not be opened: choosing photos becomes the main way in and the camera a quiet retry. */
	cameraBlocked?: boolean
	onAdd: (files: FileList | File[]) => void
	onScan: () => void
	onRemove: (id: string) => void
	onDismissRejection: (id: string) => void
}

/**
 * The photo field of the upload form (canvas R2, option A). Before the first photo it is a way in: on a phone, Scan Receipt is the
 * one primary and Choose Photos sits under it; from `sm` the drop zone leads and Scan with Camera is the alternative. With photos it
 * is a row of numbered squares and two tiles, Scan Next Part and From Device. It is a list when a photo was refused or while sending.
 */
export function UploadTicketPhotos({
	inputId,
	descriptionId,
	errorId,
	previews,
	rejections,
	max,
	uploading,
	cameraBlocked = false,
	onAdd,
	onScan,
	onRemove,
	onDismissRejection,
}: Props) {
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
	// Phone and computer layouts are both in the page (one hidden by CSS), so each input gets its own id.
	const renderFileInput = (id = inputId) => (
		<input
			id={id}
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
	const fileInput = renderFileInput()
	const limits = (
		<span className='text-center text-xs leading-4 text-muted-foreground'>
			Up to <span className='font-mono'>{max}</span> photos · PNG or JPG · <span className='font-mono'>{MAX_TICKET_IMAGE_MB}</span> MB each
		</span>
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
				<>
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
								<span
									aria-hidden='true'
									className='absolute bottom-1.5 left-1.5 flex h-4.5 items-center rounded-full bg-inverse/80 px-1.5 font-mono text-xs leading-none font-medium text-white tabular-nums'
								>
									{index + 1}
								</span>
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
							<>
								<li>
									<Button
										type='button'
										variant='dropzone'
										size='tile'
										data-testid='receipt-scan-next'
										onClick={onScan}
									>
										<HugeiconsIcon icon={ScanTextIcon} strokeWidth={1.8} className='size-5' />
										<span className='flex flex-col items-center gap-0.5'>
											<span>Scan Next</span>
											<span>Part</span>
										</span>
									</Button>
								</li>
								<li>
									<Button
										asChild
										onDrop={handleDrop}
										onDragOver={event => event.preventDefault()}
										variant='dropzone-quiet'
										size='tile'
										aria-describedby={describedBy}
									>
										<span className='relative'>
											<HugeiconsIcon icon={Image01Icon} strokeWidth={1.8} className='size-5' />
											<span className='flex flex-col items-center gap-0.5'>
												<span>From</span>
												<span>Device</span>
											</span>
											{fileInput}
										</span>
									</Button>
								</li>
							</>
						) : null}
					</ul>
					<p className='text-xs leading-4 text-muted-foreground'>
						{full ? `${max} photos is the most for one receipt.` : 'Long receipt? Scan it in parts, top to bottom.'}
					</p>
				</>
			) : cameraBlocked ? (
				// The camera failed: the device photos lead and the camera stays as a quiet retry.
				<div className='flex flex-col gap-3'>
					<div className='flex flex-col gap-2'>
						<Button
							asChild
							size='xl'
							className='w-full'
							aria-describedby={describedBy}
						>
							<span className='relative'>
								<HugeiconsIcon icon={Image01Icon} strokeWidth={1.8} className='size-4.5' />
								Choose Photos
								{fileInput}
							</span>
						</Button>
						{limits}
					</div>
					<Button
						type='button'
						variant='outline'
						size='xl'
						className='w-full'
						data-testid='receipt-scan-entry'
						onClick={onScan}
					>
						<HugeiconsIcon icon={ScanTextIcon} strokeWidth={1.8} className='size-4.5' />
						Try the Camera Again
					</Button>
				</div>
			) : (
				<>
					{/* A phone: scanning is the one primary, and the device photos are right under it. */}
					<div className='flex flex-col gap-4 sm:hidden'>
						<Button
							type='button'
							size='hero'
							data-testid='receipt-scan-entry'
							onClick={onScan}
						>
							<span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15'>
								<HugeiconsIcon icon={ScanTextIcon} strokeWidth={1.6} className='size-6.5' />
							</span>
							<span className='flex min-w-0 flex-1 flex-col gap-0.5'>
								<span className='font-display text-base leading-6 font-semibold'>Scan Receipt</span>
								<span className='text-sm leading-5 font-normal text-primary-foreground/85'>
									Opens the camera. We find the edges and straighten it.
								</span>
							</span>
							<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-5 shrink-0' />
						</Button>
						<div
							aria-hidden='true'
							className='flex items-center gap-3 text-xs text-muted-foreground'
						>
							<span className='h-px flex-1 bg-border' />
							or
							<span className='h-px flex-1 bg-border' />
						</div>
						<div className='flex flex-col gap-2'>
							<Button
								asChild
								variant='outline'
								size='xl'
								className='w-full'
								aria-describedby={describedBy}
							>
								<span className='relative'>
									<HugeiconsIcon icon={Image01Icon} strokeWidth={1.8} className='size-4.5' />
									Choose Photos
									{fileInput}
								</span>
							</Button>
							{limits}
						</div>
					</div>
					{/* A computer: a webcam is a poor scanner, so the drop zone leads and the camera is the alternative. */}
					<div className='hidden flex-col gap-3 sm:flex'>
						<Button
							asChild
							onDrop={handleDrop}
							onDragOver={event => event.preventDefault()}
							variant='dropzone'
							size='dropzone'
							aria-describedby={describedBy}
							className='w-full'
						>
							<span className='relative'>
								<RowIcon icon={Upload06Icon} tone='primary' size='dropzone' testId='upload-ticket-dropzone-icon' />
								<span className='flex flex-col items-center gap-0.5'>
									<span className='font-display text-sm font-semibold text-foreground'>Drag and drop photos here</span>
									<span className='font-display text-sm font-semibold text-blue-700 dark:text-blue-400'>or Choose Photos</span>
								</span>
								<span className='flex max-w-65 flex-col font-sans text-xs leading-[1.45] font-normal text-muted-foreground dark:text-muted-foreground'>
									<span>Up to {max} photos · PNG or JPG ·</span>
									<span>{MAX_TICKET_IMAGE_MB} MB each</span>
								</span>
								{renderFileInput(`${inputId}-drop`)}
							</span>
						</Button>
						<div className='flex items-center justify-between gap-3'>
							<span className='text-sm text-muted-foreground'>Receipt in hand?</span>
							<Button
								type='button'
								variant='outline'
								size='lg'
								data-testid='receipt-scan-entry-desktop'
								onClick={onScan}
							>
								<HugeiconsIcon icon={ScanTextIcon} strokeWidth={1.8} className='size-4.5' />
								Scan with Camera
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
