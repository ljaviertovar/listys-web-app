'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import { formatPhotoSize, rejectionMessage, rejectionReason } from './helpers/classify-photo'
import type { PhotoPreview, PhotoRejection } from './hooks/use-photo-picker'

interface UploadPhotoRowsProps {
	previews: PhotoPreview[]
	rejections: PhotoRejection[]
	/** The photos are on their way: each row shows that it is being sent instead of that it is ready. */
	uploading: boolean
	onDismissRejection: (id: string) => void
}

/** The paper stand-in of a photo that has no preview (one that was refused). */
function PaperThumb() {
	return (
		<span
			aria-hidden='true'
			className='flex h-13 w-10 shrink-0 flex-col gap-1 rounded-xl bg-linear-to-b from-white to-slate-100 px-1.25 py-1.5 opacity-60 ring-1 ring-slate-900/8 ring-inset'
		>
			<i className='block h-1 rounded-xs bg-slate-300' />
			<i className='block h-1 w-[70%] rounded-xs bg-slate-300' />
			<i className='block h-1 rounded-xs bg-slate-300' />
		</span>
	)
}

function PhotoThumb({ url }: { url: string }) {
	return (
		<span className='h-13 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-900/8 ring-inset'>
			{/* eslint-disable-next-line @next/next/no-img-element -- a local object URL preview */}
			<img
				src={url}
				alt=''
				className='size-full object-cover'
			/>
		</span>
	)
}

/**
 * The photos as a list, for the two moments a grid of squares says too little: a refused photo that has to say why, and photos
 * being sent. Every row keeps the file name in mono so a person can tell which photo it is about.
 */
export function UploadPhotoRows({ previews, rejections, uploading, onDismissRejection }: UploadPhotoRowsProps) {
	return (
		<ul
			data-testid='upload-ticket-photo-rows'
			className='flex flex-col gap-2'
		>
			{previews.map(photo => (
				<li
					key={photo.id}
					data-testid='upload-ticket-photo-row'
					className='flex items-center gap-3 rounded-2xl bg-muted p-2.5'
				>
					<PhotoThumb url={photo.url} />
					<span className='flex min-w-0 flex-1 flex-col gap-1.5'>
						<span className='truncate font-mono text-xs leading-[1.3] font-semibold text-foreground'>{photo.file.name}</span>
						{uploading ? (
							<Progress
								indeterminate
								size='sm'
								tone='track'
								aria-label={`Uploading ${photo.file.name}`}
							/>
						) : (
							<span className='text-xs leading-[1.4] text-slate-500 dark:text-muted-foreground'>{formatPhotoSize(photo.file.size)} · Ready</span>
						)}
					</span>
					{uploading ? null : (
						<HugeiconsIcon
							icon={Tick02Icon}
							strokeWidth={2}
							role='img'
							aria-label='Ready'
							className='size-5 shrink-0 text-green-700 dark:text-green-400'
						/>
					)}
				</li>
			))}
			{rejections.map(rejection => {
				const message = rejectionMessage(rejection.name, rejection.reason)
				return (
					<li
						key={rejection.id}
						role='alert'
						data-testid='upload-ticket-rejection'
						className='flex flex-col gap-2 rounded-2xl bg-red-50 p-2.5 ring-2 ring-red-200 ring-inset dark:bg-red-950/60 dark:ring-red-500/30'
					>
						<span className='flex items-center gap-3'>
							<PaperThumb />
							<span className='flex min-w-0 flex-1 flex-col gap-1'>
								<span className='truncate font-mono text-xs leading-[1.3] font-semibold text-foreground'>{rejection.name}</span>
								<span className='text-xs leading-[1.4] text-red-700 dark:text-red-300'>
									{formatPhotoSize(rejection.size)} · {rejectionReason(rejection.reason)}
								</span>
							</span>
							<Button
								type='button'
								onClick={() => onDismissRejection(rejection.id)}
								aria-label={`Remove ${rejection.name}`}
								variant='quiet'
								size='icon-xl'
								className='-mr-1.5 shrink-0'
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									strokeWidth={1.8}
									className='size-4.5'
								/>
							</Button>
						</span>
						<span className='flex gap-1.5 text-xs leading-[1.4] font-medium text-red-700 dark:text-red-300'>
							<HugeiconsIcon
								icon={Alert02Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='mt-px size-3.5 shrink-0'
							/>
							{message.hint}
						</span>
					</li>
				)
			})}
		</ul>
	)
}
