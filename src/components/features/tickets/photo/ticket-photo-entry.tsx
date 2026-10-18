'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowExpand01Icon, Image02Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils'
import { Button } from '@/components/ui/button'

import { TicketPhotoControls, TicketPhotoThumbs } from './ticket-photo-tools'
import { TicketPhotoPane } from './ticket-photo-pane'
import type { PhotoView } from './hooks/use-photo-view'

interface TicketPhotoRowProps {
	/** Photos the receipt has, known before any of them is signed. */
	count: number
	/** Signed URL of the first photo, when it has loaded. */
	thumbnailUrl: string | undefined
	onOpen: () => void
}

/**
 * The way into the receipt photo, right under the title so it is never buried below the item list: a thumbnail, how many
 * photos there are and one 44px control. The whole row is the button.
 */
export function TicketPhotoRow({ count, thumbnailUrl, onOpen }: TicketPhotoRowProps) {
	const plural = count === 1 ? 'photo' : 'photos'

	return (
		<button
			type='button'
			onClick={onOpen}
			data-testid='ticket-photo-row'
			aria-label={`View receipt ${plural}, ${count} ${plural}`}
			className={cn(
				'group flex min-h-[100px] w-full items-center gap-3.5 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-muted md:p-4',
				'rounded-3xl bg-card shadow-card',
				'focus-ring',
			)}
		>
			<span className='relative flex h-19 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900'>
				{thumbnailUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL, not an optimisable asset
					<img
						src={thumbnailUrl}
						alt=''
						className='size-full object-cover'
					/>
				) : (
					<HugeiconsIcon
						icon={Image02Icon}
						strokeWidth={1.5}
						className='size-6 text-slate-400'
					/>
				)}
				{count > 1 ? (
					<span className='absolute right-1 bottom-1 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-xs leading-none font-semibold text-white tabular-nums'>
						{count}
					</span>
				) : null}
			</span>
			<span className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span className='font-display text-base leading-normal font-semibold '>
					{count === 1 ? 'Receipt Photo' : 'Receipt Photos'}
				</span>
				<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>
					<b className='font-mono font-semibold text-foreground tabular-nums'>{count}</b> {plural} · Tap to enlarge
				</span>
			</span>
			<span
				aria-hidden='true'
				className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-blue-700 dark:bg-muted dark:text-blue-400'
			>
				<HugeiconsIcon
					icon={ArrowExpand01Icon}
					strokeWidth={1.8}
					className='size-5'
				/>
			</span>
		</button>
	)
}

interface TicketPhotoPanelProps {
	urls: string[]
	/** Photos the receipt has, known before any of them is signed. */
	count: number
	view: PhotoView
	error?: string | null
	onOpenFullScreen: () => void
}

/**
 * The receipt photo beside the items on a wide screen, so it never scrolls out of reach: a dark stage with the zoom, rotate and fit
 * controls over it, the strip of shots when there are several, and a way into the full-screen viewer. The page keeps it in view while
 * the long list scrolls. Phones use the one-line `TicketPhotoRow` instead.
 */
export function TicketPhotoPanel({ urls, count, view, error, onOpenFullScreen }: TicketPhotoPanelProps) {
	return (
		<section
			data-testid='ticket-photo-panel'
			aria-label={count === 1 ? 'Receipt photo' : 'Receipt photos'}
			className='flex flex-col gap-3 rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			<div className='flex items-center gap-3'>
				<span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'>
					<HugeiconsIcon
						icon={Image02Icon}
						strokeWidth={1.5}
						className='size-5'
					/>
				</span>
				<h2 className='min-w-0 flex-1 truncate font-display text-base leading-normal font-semibold '>
					{count === 1 ? 'Receipt Photo' : 'Receipt Photos'}
				</h2>
				<Button
					type='button'
					onClick={onOpenFullScreen}
					variant='secondary'
					size='lg'
				>
					<HugeiconsIcon
						icon={ArrowExpand01Icon}
						strokeWidth={1.8}
						className='size-4.5'
					/>
					Open Full Screen
				</Button>
			</div>

			<div className='relative flex h-[420px] flex-col overflow-hidden rounded-2xl bg-ink'>
				<TicketPhotoPane
					url={urls[view.index]}
					alt={`Receipt photo ${view.index + 1} of ${Math.max(count, 1)}`}
					zoom={view.zoom}
					rotation={view.rotation}
					onZoomChange={view.setZoom}
					onDoubleTap={view.toggleZoom}
					emptyMessage={error ?? undefined}
					className='p-3'
				/>
				{urls.length > 0 ? (
					<TicketPhotoControls
						view={view}
						className='absolute bottom-3 left-1/2 w-max -translate-x-1/2 gap-2 rounded-2xl bg-slate-900/80 p-1.5 backdrop-blur lg:justify-center lg:gap-2'
					/>
				) : null}
			</div>

			{urls.length > 1 ? (
				<div className='flex items-center justify-between gap-3'>
					<TicketPhotoThumbs
						urls={urls}
						current={view.index}
						onSelect={view.select}
						layout='horizontal'
						tone='light'
						className='px-0 py-0.5'
					/>
					<span
						aria-hidden='true'
						className='font-mono text-xs font-medium text-slate-500 tabular-nums'
					>
						{view.index + 1} / {urls.length}
					</span>
				</div>
			) : null}
		</section>
	)
}
