'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowExpand01Icon, Image02Icon } from '@hugeicons/core-free-icons'
import type { Ref } from 'react'

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
	triggerRef?: Ref<HTMLButtonElement>
}

/**
 * The way into the receipt photo, right under the title so it is never buried below the item list: a thumbnail, how many
 * photos there are and one 44px control. The whole row is the button.
 */
export function TicketPhotoRow({ count, thumbnailUrl, onOpen, triggerRef }: TicketPhotoRowProps) {
	const plural = count === 1 ? 'photo' : 'photos'

	return (
		<button
			ref={triggerRef}
			type='button'
			onClick={onOpen}
			data-testid='ticket-photo-row'
			aria-label={`View receipt ${plural}, ${count} ${plural}`}
			className={cn(
				'group flex min-h-16 w-full items-center gap-3 px-2.5 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-muted',
				'rounded-2xl bg-card shadow-card',
				'focus-ring',
			)}
		>
			<span className='relative flex h-13 w-10 shrink-0 flex-col gap-1 overflow-hidden rounded-xl bg-gradient-to-b from-white to-slate-100 px-1.25 py-1.5 ring-1 ring-slate-900/8 ring-inset'>
				{thumbnailUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL, not an optimisable asset
					<img
						src={thumbnailUrl}
						alt=''
						className='absolute inset-0 size-full object-cover'
					/>
				) : (
					// Until the photo has signed (or when it cannot be shown), a sketch of a receipt stands in for it.
					<>
						<i className='block h-1 rounded-xs bg-slate-300' />
						<i className='block h-1 w-[70%] rounded-xs bg-slate-300' />
						<i className='block h-1 rounded-xs bg-slate-300' />
					</>
				)}
			</span>
			<span className='flex min-w-0 flex-1 flex-col gap-0.5 font-sans'>
				<span className='text-sm leading-[1.3] font-semibold'>Receipt Photo</span>
				<span className='text-sm leading-[1.2] text-body dark:text-muted-foreground'>
					<b className='font-mono text-base font-bold text-foreground tabular-nums'>{count}</b> {plural} · Tap to enlarge
				</span>
			</span>
			<HugeiconsIcon
				icon={ArrowExpand01Icon}
				strokeWidth={1.8}
				aria-hidden='true'
				className='size-4.5 shrink-0'
			/>
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
	triggerRef?: Ref<HTMLButtonElement>
}

/**
 * The receipt photo beside the items on a wide screen, so it never scrolls out of reach: a dark stage with the zoom, rotate and fit
 * controls over it, the strip of shots when there are several, and a way into the full-screen viewer. The page keeps it in view while
 * the long list scrolls. Phones use the one-line `TicketPhotoRow` instead.
 */
export function TicketPhotoPanel({ urls, count, view, error, onOpenFullScreen, triggerRef }: TicketPhotoPanelProps) {
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
					ref={triggerRef}
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
						className='font-mono text-xs font-medium text-muted-foreground tabular-nums'
					>
						{view.index + 1} / {urls.length}
					</span>
				</div>
			) : null}
		</section>
	)
}
