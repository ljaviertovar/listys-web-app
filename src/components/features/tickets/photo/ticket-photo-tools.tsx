'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, MinusSignIcon, RotateTopRightIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

import { MAX_ZOOM, MIN_ZOOM, formatZoom } from './helpers/photo-zoom'
import type { PhotoView } from './hooks/use-photo-view'

interface TicketPhotoControlsProps {
	view: PhotoView
	className?: string
}


/** Zoom out, the zoom level, zoom in, rotate and fit: the same controls under the full-screen photo and over the side panel's. */
export function TicketPhotoControls({ view, className }: TicketPhotoControlsProps) {
	return (
		<div
			data-testid='ticket-photo-controls'
			className={cn('flex items-center justify-between gap-2 lg:justify-center lg:gap-3', className)}
		>
			<div className='flex items-center gap-2'>
				<Button
					type='button'
					aria-label='Zoom Out'
					disabled={view.zoom <= MIN_ZOOM}
					onClick={view.zoomOut}
					variant='on-dark'
					size='icon-xl'
				>
					<HugeiconsIcon
						icon={MinusSignIcon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</Button>
				<span
					role='status'
					aria-label='Zoom level'
					className='min-w-14 text-center font-mono text-sm font-semibold text-white tabular-nums'
				>
					{formatZoom(view.zoom)}
				</span>
				<Button
					type='button'
					aria-label='Zoom In'
					disabled={view.zoom >= MAX_ZOOM}
					onClick={view.zoomIn}
					variant='on-dark'
					size='icon-xl'
				>
					<HugeiconsIcon
						icon={Add01Icon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</Button>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					type='button'
					aria-label='Rotate Photo'
					onClick={view.rotate}
					variant='on-dark'
					size='icon-xl'
				>
					<HugeiconsIcon
						icon={RotateTopRightIcon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</Button>
				<Button
					type='button'
					onClick={view.fit}
					variant='on-dark'
					size='primary'
				>
					Fit
				</Button>
			</div>
		</div>
	)
}

interface TicketPhotoThumbsProps {
	urls: string[]
	current: number
	onSelect: (index: number) => void
	className?: string
	/** `responsive` runs under the photo on a phone and down its left side from `lg`; `horizontal` always runs along the bottom. */
	layout?: 'responsive' | 'horizontal'
	/** `light` is for a white card, `dark` for the full-screen viewer. */
	tone?: 'dark' | 'light'
}

/** The strip of a photo with several shots (under it on a phone, a column beside it from `lg`): 48px targets, the current one ringed and marked for screen readers. */
export function TicketPhotoThumbs({ urls, current, onSelect, className, layout = 'responsive', tone = 'dark' }: TicketPhotoThumbsProps) {
	return (
		<ul
			data-testid='ticket-photo-thumbs'
			aria-label='Receipt photos'
			className={cn(
				'flex shrink-0 items-center gap-3 overflow-x-auto px-4 pt-2.5 pb-0.5',
				layout === 'responsive' && 'lg:w-28 lg:flex-col lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto lg:px-4 lg:py-2',
				className,
			)}
		>
			{urls.map((url, index) => (
				<li key={url}>
					<button
						type='button'
						onClick={() => onSelect(index)}
						aria-label={`Photo ${index + 1}${index === current ? ', current' : ''}`}
						aria-current={index === current ? 'true' : undefined}
						className={cn(
							'flex min-h-12 min-w-12 items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:outline-none',
							tone === 'dark' ? 'focus-visible:ring-blue-400' : 'focus-visible:ring-blue-500',
							index === current ? 'opacity-100' : 'opacity-60 hover:opacity-90',
						)}
					>
						{/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL */}
						<img
							src={url}
							alt=''
							className={cn(
								'h-15 w-11 rounded-lg object-cover',
								index === current &&
									(tone === 'dark'
										? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-ink'
										: 'ring-2 ring-blue-500 ring-offset-2 ring-offset-card'),
							)}
						/>
					</button>
				</li>
			))}
		</ul>
	)
}
