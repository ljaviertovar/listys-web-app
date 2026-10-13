'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, MinusSignIcon, RotateTopRightIcon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils'

import { MAX_ZOOM, MIN_ZOOM, formatZoom } from './helpers/photo-zoom'
import type { PhotoView } from './hooks/use-photo-view'

interface TicketPhotoControlsProps {
	view: PhotoView
	className?: string
}

const BUTTON =
	'inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/12 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-white/12'

/** Zoom out, the zoom level, zoom in, rotate and fit: the same controls under the full-screen photo and over the side panel's. */
export function TicketPhotoControls({ view, className }: TicketPhotoControlsProps) {
	return (
		<div
			data-testid='ticket-photo-controls'
			className={cn('flex items-center justify-between gap-2 lg:justify-center lg:gap-3', className)}
		>
			<div className='flex items-center gap-2'>
				<button
					type='button'
					aria-label='Zoom Out'
					disabled={view.zoom <= MIN_ZOOM}
					onClick={view.zoomOut}
					className={cn(BUTTON, 'w-11')}
				>
					<HugeiconsIcon
						icon={MinusSignIcon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</button>
				<span
					role='status'
					aria-label='Zoom level'
					className='min-w-14 text-center font-mono text-sm font-semibold text-white tabular-nums'
				>
					{formatZoom(view.zoom)}
				</span>
				<button
					type='button'
					aria-label='Zoom In'
					disabled={view.zoom >= MAX_ZOOM}
					onClick={view.zoomIn}
					className={cn(BUTTON, 'w-11')}
				>
					<HugeiconsIcon
						icon={Add01Icon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</button>
			</div>
			<div className='flex items-center gap-2'>
				<button
					type='button'
					aria-label='Rotate Photo'
					onClick={view.rotate}
					className={cn(BUTTON, 'w-11')}
				>
					<HugeiconsIcon
						icon={RotateTopRightIcon}
						strokeWidth={1.8}
						className='size-5'
					/>
				</button>
				<button
					type='button'
					onClick={view.fit}
					className={cn(BUTTON, 'px-3.5')}
				>
					Fit
				</button>
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
							'flex min-h-12 min-w-12 items-center justify-center rounded-[12px] focus-visible:ring-2 focus-visible:outline-none',
							tone === 'dark' ? 'focus-visible:ring-blue-400' : 'focus-visible:ring-blue-500',
							index === current ? 'opacity-100' : 'opacity-60 hover:opacity-90',
						)}
					>
						{/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL */}
						<img
							src={url}
							alt=''
							className={cn(
								'h-[60px] w-11 rounded-[10px] object-cover',
								index === current &&
									(tone === 'dark'
										? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0B1220]'
										: 'ring-2 ring-blue-500 ring-offset-2 ring-offset-card'),
							)}
						/>
					</button>
				</li>
			))}
		</ul>
	)
}
