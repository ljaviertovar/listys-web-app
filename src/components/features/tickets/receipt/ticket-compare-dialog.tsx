'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, MinusSignIcon } from '@hugeicons/core-free-icons'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/utils'
import type { TicketItem } from '@/types'

import { TicketItemsList } from './ticket-items-list'
import { TicketPhotoPane } from '../photo/ticket-photo-pane'
import { TicketSelectionBar } from './ticket-selection-bar'
import { MAX_ZOOM, MIN_ZOOM } from '../photo/helpers/photo-zoom'
import type { PhotoView } from '../photo/hooks/use-photo-view'
import type { TicketSelection } from './hooks/use-ticket-selection'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	urls: string[]
	view: PhotoView
	items: TicketItem[]
	selection: TicketSelection
	canSelect: boolean
	onAddToList: () => void
}

/** Share of the screen the photo takes (its height on a phone, its width from `lg`). The handle moves it within these limits. */
const MIN_SPLIT = 0.2
const MAX_SPLIT = 0.7
const KEY_SPLIT_STEP = 0.05

const DARK_BUTTON =
	'inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-white/12 px-3.5 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-white/12'
const OVERLAY_BUTTON =
	'inline-flex size-11 items-center justify-center rounded-[12px] bg-slate-900/80 text-white transition-colors hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-40'

/**
 * The photo next to the extracted items in one screen, so a line can be checked against the paper and ticked without scrolling back
 * and forth: the photo above the list on a phone, on its left from `lg`. The handle between them resizes the two by pointer or keyboard.
 */
export function TicketCompareDialog({ open, onOpenChange, title, urls, view, items, selection, canSelect, onAddToList }: Props) {
	// `null` keeps the default of each layout (38% of the height on a phone, 60% of the width beside the list).
	const [split, setSplit] = useState<number | null>(null)
	const sideBySide = useMediaQuery('(min-width: 64rem)')
	const containerRef = useRef<HTMLDivElement>(null)

	const clampSplit = (value: number) => Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, value))
	const defaultSplit = sideBySide ? 0.6 : 0.38

	const dragTo = (clientX: number, clientY: number) => {
		const box = containerRef.current?.getBoundingClientRect()
		if (!box || box.height === 0 || box.width === 0) return
		setSplit(clampSplit(sideBySide ? (clientX - box.left) / box.width : (clientY - box.top) / box.height))
	}

	const nudge = (delta: number) => setSplit(current => clampSplit((current ?? defaultSplit) + delta))

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				hideClose
				data-testid='ticket-compare-dialog'
				onOpenAutoFocus={event => event.preventDefault()}
				className='top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-[#0B1220] p-0 text-white data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0'
			>
				<div className='flex h-15 shrink-0 items-center gap-2 px-2 lg:h-[72px] lg:px-5'>
					<DialogClose
						aria-label='Close Compare'
						className={cn(DARK_BUTTON, 'w-11 px-0')}
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							strokeWidth={1.8}
							className='size-5'
						/>
					</DialogClose>
					<div className='flex min-w-0 flex-1 items-baseline justify-center gap-3 lg:justify-start lg:pl-1'>
						<DialogTitle className='font-display text-[15px] leading-none font-bold tracking-normal text-white lg:text-base'>
							Compare
						</DialogTitle>
						<span className='hidden truncate font-mono text-xs leading-none font-medium text-slate-400 tabular-nums lg:inline'>
							{title}
							{urls.length > 0 ? ` · photo ${view.index + 1} / ${urls.length}` : ''}
						</span>
					</div>
					<DialogClose className={cn(DARK_BUTTON, 'bg-blue-600 hover:bg-blue-500')}>Done</DialogClose>
				</div>
				<DialogDescription className='sr-only'>
					The receipt photo and its extracted items side by side. Drag the handle or use the arrow keys to resize them.
				</DialogDescription>

				<div
					ref={containerRef}
					className='flex min-h-0 flex-1 flex-col lg:flex-row'
				>
					<div
						className='relative flex min-h-0 min-w-0 shrink-0 basis-[var(--split,38%)] flex-col bg-[#0B1220] lg:basis-[var(--split,60%)]'
						style={split === null ? undefined : ({ '--split': `${split * 100}%` } as CSSProperties)}
					>
						<TicketPhotoPane
							url={urls[view.index]}
							alt={`Receipt photo ${view.index + 1} of ${urls.length}`}
							zoom={view.zoom}
							rotation={view.rotation}
							onZoomChange={view.setZoom}
							onDoubleTap={view.toggleZoom}
							wheelZoom
						/>
						<div className='absolute right-2.5 bottom-2.5 flex gap-2'>
							{urls.length > 1 ? (
								<>
									<button
										type='button'
										aria-label='Previous Photo'
										disabled={view.index === 0}
										onClick={view.previous}
										className={OVERLAY_BUTTON}
									>
										<HugeiconsIcon
											icon={ArrowLeft01Icon}
											strokeWidth={1.8}
											className='size-5'
										/>
									</button>
									<button
										type='button'
										aria-label='Next Photo'
										disabled={view.index === urls.length - 1}
										onClick={view.next}
										className={OVERLAY_BUTTON}
									>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											strokeWidth={1.8}
											className='size-5'
										/>
									</button>
								</>
							) : null}
							<button
								type='button'
								aria-label='Zoom Out'
								disabled={view.zoom <= MIN_ZOOM}
								onClick={view.zoomOut}
								className={OVERLAY_BUTTON}
							>
								<HugeiconsIcon
									icon={MinusSignIcon}
									strokeWidth={1.8}
									className='size-5'
								/>
							</button>
							<button
								type='button'
								aria-label='Zoom In'
								disabled={view.zoom >= MAX_ZOOM}
								onClick={view.zoomIn}
								className={OVERLAY_BUTTON}
							>
								<HugeiconsIcon
									icon={Add01Icon}
									strokeWidth={1.8}
									className='size-5'
								/>
							</button>
						</div>
					</div>

					<div
						role='separator'
						aria-orientation={sideBySide ? 'vertical' : 'horizontal'}
						aria-label='Resize the photo'
						aria-valuemin={Math.round(MIN_SPLIT * 100)}
						aria-valuemax={Math.round(MAX_SPLIT * 100)}
						aria-valuenow={Math.round((split ?? defaultSplit) * 100)}
						tabIndex={0}
						onPointerDown={event => {
							event.currentTarget.setPointerCapture(event.pointerId)
							dragTo(event.clientX, event.clientY)
						}}
						onPointerMove={event => {
							if (event.currentTarget.hasPointerCapture(event.pointerId)) dragTo(event.clientX, event.clientY)
						}}
						onKeyDown={event => {
							const grow = sideBySide ? 'ArrowRight' : 'ArrowDown'
							const shrink = sideBySide ? 'ArrowLeft' : 'ArrowUp'
							if (event.key === grow) nudge(KEY_SPLIT_STEP)
							else if (event.key === shrink) nudge(-KEY_SPLIT_STEP)
							else return
							event.preventDefault()
						}}
						className='-mb-px flex h-7 shrink-0 cursor-row-resize touch-none items-center justify-center rounded-t-3xl bg-card focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none lg:mb-0 lg:-mr-px lg:h-auto lg:w-4 lg:cursor-col-resize lg:rounded-none'
					>
						<span className='block h-[5px] w-10 rounded-full bg-slate-300 lg:h-10 lg:w-[5px]' />
					</div>

					<div className='flex min-h-0 min-w-0 flex-1 flex-col bg-card text-card-foreground'>
						<div className='min-h-0 flex-1 overflow-y-auto px-3.5 pb-6 lg:px-5'>
							<div className='flex items-center gap-3 px-0.5 pt-1 pb-2 lg:pt-4'>
								<h2 className='flex-1 font-display text-base leading-normal font-semibold tracking-[-0.005em]'>
									Extracted Items
								</h2>
								<span className='text-[13px] leading-[1.3] text-slate-500'>
									<b className='font-mono font-semibold text-foreground tabular-nums'>{items.length}</b> items found
								</span>
							</div>
							<TicketItemsList
								items={items}
								selection={selection}
								canSelect={canSelect}
							/>
						</div>
						{/* Beside the list the bar belongs to this panel; on a phone the Done button is the way back to the page's own bar. */}
						<div className='hidden lg:contents'>
							<TicketSelectionBar
								count={selection.count}
								total={selection.total}
								onClear={selection.clear}
								onAdd={onAddToList}
								placement='panel'
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
