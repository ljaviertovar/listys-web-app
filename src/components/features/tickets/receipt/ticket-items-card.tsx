'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ListViewIcon, Loading03Icon, PackageSearchIcon, SpamIcon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { TicketItemsList, type TicketItemsTriage } from './ticket-items-list'
import { TicketStatusListener } from './ticket-status-listener'

import type { TicketItem } from '@/types'
import type { TicketStatus } from '../helpers/ticket-status'
import type { TicketSelection } from './hooks/use-ticket-selection'

interface TicketItemsCardProps {
	ticketId: string
	items: TicketItem[]
	status: TicketStatus
	ocrError?: string | null
	selection: TicketSelection
	/** The selection bar: it floats over the page on a phone and sticks to the bottom of this card from `lg`. */
	footer?: ReactNode
	triage?: TicketItemsTriage
}

function ItemsBody({ items, status, selection, triage }: Omit<TicketItemsCardProps, 'ticketId'>) {
	if (status === 'pending' || status === 'processing') {
		return (
			<div className='flex flex-col items-center justify-center py-12'>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='size-12 animate-spin text-primary motion-reduce:animate-none'
				/>
				<p
					role='status'
					className='mt-4 text-sm text-muted-foreground'
				>
					{status === 'pending' ? 'Your receipt is uploaded and waiting to be read.' : 'Reading your receipt…'}
				</p>
			</div>
		)
	}

	if (status === 'failed') {
		return <TicketProcessingError />
	}

	if (items.length === 0) {
		return <TicketNoItems />
	}

	return (
		<TicketItemsList
			items={items}
			selection={selection}
			canSelect={status === 'completed'}
			triage={triage}
		/>
	)
}

/** The receipt's extracted items: who is reading it (status chip, live), and then the list, or why there is none yet. */
export function TicketItemsCard({ ticketId, items, status, ocrError, selection, footer, triage }: TicketItemsCardProps) {
	return (
		<section
			data-testid='ticket-items-card'
			aria-labelledby='ticket-items-title'
			className='rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			<div className='flex items-center gap-3 px-0.5'>
				<span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
					<HugeiconsIcon
						icon={ListViewIcon}
						strokeWidth={1.5}
						className='size-5'
					/>
				</span>
				<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
					<h2
						id='ticket-items-title'
						className='font-display text-base leading-normal font-semibold '
					>
						Extracted Items
					</h2>
					{status === 'completed' ? (
						<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>
							<b className='font-mono font-semibold text-foreground tabular-nums'>{items.length}</b>{' '}
							{items.length === 1 ? 'item' : 'items'} found
						</span>
					) : null}
				</div>
				<TicketStatusListener
					ticketId={ticketId}
					initialStatus={status}
				/>
			</div>
			<ItemsBody
				items={items}
				status={status}
				ocrError={ocrError}
				selection={selection}
				triage={triage}
			/>
			{footer}
		</section>
	)
}

const TIPS = [
	'Lay the receipt flat and smooth out the folds.',
	'Use even light, without shadows or glare.',
	'Fit the whole receipt in the frame.',
]

/**
 * A receipt that was read but gave no items. It says why, as a warning rather than an error, and how to get a better read; the
 * actions that follow (upload again, try again, delete) live in the receipt's own action card.
 */
export function TicketNoItems() {
	return (
		<div
			data-testid='ticket-no-items'
			className='mt-4 flex flex-col items-center gap-4 border-t border-slate-100 px-1 pt-6 pb-4 text-center dark:border-border'
		>
			<span
				aria-hidden='true'
				className='flex size-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
			>
				<HugeiconsIcon
					icon={PackageSearchIcon}
					strokeWidth={1.5}
					className='size-8'
				/>
			</span>
			<div className='flex flex-col items-center gap-1.5'>
				<h3 className='font-display text-base leading-[1.3] font-bold md:text-lg'>No items detected</h3>
				<p className='max-w-[300px] text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
					We couldn’t find items in this receipt. Upload a new receipt with a clearer photo, or read this receipt again.
				</p>
			</div>
			<ul
				aria-label='Tips for a clearer photo'
				className='flex w-full max-w-md flex-col gap-2.5 rounded-2xl bg-muted p-3.5 text-left dark:bg-muted/50'
			>
				{TIPS.map(tip => (
					<li
						key={tip}
						className='flex items-start gap-2.5 text-sm leading-[1.4] text-slate-700 dark:text-foreground/80'
					>
						<span className='mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-blue-700 dark:bg-muted dark:text-blue-300'>
							<HugeiconsIcon
								icon={Tick02Icon}
								strokeWidth={2}
								className='size-3.5'
							/>
						</span>
						{tip}
					</li>
				))}
			</ul>
		</div>
	)
}

export function TicketProcessingError() {
	const errorTitle = 'Failed to Process Receipt'
	const errorMessage = 'Unable to extract items from this receipt.'

	return (
		<div data-testid='ticket-processing-error' className='py-8'>
			<Alert variant='warning'>
				<HugeiconsIcon
					icon={SpamIcon}
					strokeWidth={2}
				/>
				<AlertTitle>{errorTitle}</AlertTitle>
				<AlertDescription>
					<p className='mb-2'>{errorMessage}</p>
					<div className='mt-4 space-y-1 text-sm'>
						<p className='font-medium'>What you can do:</p>
						<ul className='list-inside list-disc space-y-1 text-muted-foreground'>
							<li>Try uploading a clearer, high-resolution image</li>
							<li>Use a PNG or JPEG image</li>
							<li>Ensure the receipt text is clearly visible and not blurry</li>
							<li>Avoid images with heavy shadows or reflections</li>
						</ul>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	)
}
