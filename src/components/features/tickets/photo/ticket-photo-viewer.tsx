'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, LayoutTwoRowIcon } from '@hugeicons/core-free-icons'
import type { KeyboardEvent } from 'react'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils'

import { TicketPhotoControls, TicketPhotoThumbs } from './ticket-photo-tools'
import { TicketPhotoPane } from './ticket-photo-pane'
import type { PhotoView } from './hooks/use-photo-view'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	urls: string[]
	view: PhotoView
	/** Shown when no photo could be loaded. */
	error?: string | null
	/** Opens the photo next to the extracted items; hidden when the receipt has nothing to compare against. */
	onCompare?: () => void
}

const DARK_BUTTON =
	'inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-white/12 px-3.5 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-white/12'

const ARROW_BUTTON =
	'absolute top-1/2 hidden size-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-30 lg:flex'

/**
 * The receipt photo on its own, full screen: close and compare on top, the photo (pinch, double tap, wheel, drag, buttons) in the
 * middle, the strip of shots when there are several (underneath on a phone, down the left side from `lg`), and the zoom, rotate and
 * fit controls at the bottom. The arrow keys move between photos and `+`, `-` and `0` zoom.
 */
export function TicketPhotoViewer({ open, onOpenChange, title, urls, view, error, onCompare }: Props) {
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'ArrowRight') view.next()
		else if (event.key === 'ArrowLeft') view.previous()
		else if (event.key === '+' || event.key === '=') view.zoomIn()
		else if (event.key === '-') view.zoomOut()
		else if (event.key === '0') view.fit()
		else return
		event.preventDefault()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				hideClose
				data-testid='ticket-photo-viewer'
				// Focus lands on the panel itself, not on the close button, so the arrow keys and + / - work at once without a ring on it.
				onOpenAutoFocus={event => {
					event.preventDefault()
					;(event.currentTarget as HTMLElement).focus()
				}}
				onKeyDown={handleKeyDown}
				className='top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-[#0B1220] p-0 text-white data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0'
			>
				<div className='flex h-15 shrink-0 items-center gap-2 px-2 lg:h-[72px] lg:px-5'>
					<DialogClose
						aria-label='Close Photo Viewer'
						className={cn(DARK_BUTTON, 'w-11 px-0')}
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							strokeWidth={1.8}
							className='size-5'
						/>
					</DialogClose>
					<div className='flex min-w-0 flex-1 flex-col items-center gap-1 lg:flex-row lg:items-baseline lg:gap-3 lg:pl-1'>
						<DialogTitle className='max-w-full truncate font-display text-[15px] leading-none font-bold tracking-normal text-white lg:text-base'>
							{title}
						</DialogTitle>
						<span
							aria-live='polite'
							className='font-mono text-xs leading-none font-medium text-slate-400 tabular-nums'
						>
							{urls.length > 0 ? `${view.index + 1} / ${urls.length}` : 'No photo'}
						</span>
					</div>
					{onCompare && urls.length > 0 ? (
						<button
							type='button'
							onClick={onCompare}
							className={DARK_BUTTON}
						>
							<HugeiconsIcon
								icon={LayoutTwoRowIcon}
								strokeWidth={1.8}
								className='size-[18px]'
							/>
							Compare
						</button>
					) : (
						<span className='w-11 shrink-0' />
					)}
				</div>
				<DialogDescription className='sr-only'>
					Pinch, scroll or double tap to zoom the receipt photo. Use the buttons below to zoom, rotate or fit it, and the arrow keys
					to switch photos.
				</DialogDescription>

				<div className='flex min-h-0 flex-1 flex-col lg:flex-row'>
					<div className='relative flex min-h-0 min-w-0 flex-1 flex-col'>
						<TicketPhotoPane
							url={urls[view.index]}
							alt={`Receipt photo ${view.index + 1} of ${urls.length}`}
							zoom={view.zoom}
							rotation={view.rotation}
							onZoomChange={view.setZoom}
							onDoubleTap={view.toggleZoom}
							emptyMessage={error ?? undefined}
							wheelZoom
						/>
						{urls.length > 0 ? (
							<span className='pointer-events-none absolute bottom-3.5 left-1/2 inline-flex h-[30px] -translate-x-1/2 items-center rounded-full bg-slate-900/80 px-3 font-sans text-[12.5px] leading-none font-semibold whitespace-nowrap text-slate-200'>
								<span className='lg:hidden'>Pinch to zoom · Double-tap to fit</span>
								<span className='hidden lg:inline'>
									Scroll to zoom · Drag to pan{urls.length > 1 ? ' · ← → to switch photos' : ''}
								</span>
							</span>
						) : null}
						{urls.length > 1 ? (
							<>
								<button
									type='button'
									aria-label='Previous Photo'
									disabled={view.index === 0}
									onClick={view.previous}
									className={cn(ARROW_BUTTON, 'left-8')}
								>
									<HugeiconsIcon
										icon={ArrowLeft01Icon}
										strokeWidth={1.8}
										className='size-6'
									/>
								</button>
								<button
									type='button'
									aria-label='Next Photo'
									disabled={view.index === urls.length - 1}
									onClick={view.next}
									className={cn(ARROW_BUTTON, 'right-8')}
								>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										strokeWidth={1.8}
										className='size-6'
									/>
								</button>
							</>
						) : null}
					</div>
					{urls.length > 1 ? (
						<TicketPhotoThumbs
							urls={urls}
							current={view.index}
							onSelect={view.select}
							className='lg:order-first'
						/>
					) : null}
				</div>

				<TicketPhotoControls
					view={view}
					className='shrink-0 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:justify-center lg:pb-6'
				/>
			</DialogContent>
		</Dialog>
	)
}
