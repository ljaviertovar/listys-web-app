'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon, Loading03Icon, PackageSearchIcon, SpamIcon, Tick02Icon } from '@hugeicons/core-free-icons'

import { EmptyState, RowIcon } from '@/components/commons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
	canSelect?: boolean
	/** The selection bar: it floats over the page on a phone and sticks to the bottom of this card from `lg`. */
	footer?: ReactNode
	triage?: TicketItemsTriage
}

function ItemsBody({ items, status, selection, canSelect = status === 'completed', triage }: Omit<TicketItemsCardProps, 'ticketId'>) {
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
			canSelect={canSelect}
			triage={triage}
		/>
	)
}

/** The receipt's extracted items: who is reading it (status chip, live), and then the list, or why there is none yet. */
export function TicketItemsCard({ ticketId, items, status, ocrError, selection, canSelect, footer, triage }: TicketItemsCardProps) {
	return (
		<section
			data-testid='ticket-items-card'
			aria-labelledby='ticket-items-title'
		>
			<Card>
			<CardHeader><div className='flex items-center gap-3'>
				<RowIcon icon={Invoice01Icon} tone='ocr' size='lg' testId='ticket-items-icon' />
				<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
					<h2
						id='ticket-items-title'
						className='font-display text-base leading-normal font-semibold'
					>
						Extracted Items
					</h2>
					{status === 'completed' ? (
						<span className='text-xs leading-[1.3] text-muted-foreground dark:text-muted-foreground'>
							<b className='font-mono font-semibold text-foreground tabular-nums'>{items.length}</b>{' '}
							{items.length === 1 ? 'item' : 'items'} found
						</span>
					) : null}
				</div>
				{status === 'completed' ? null : (
					<TicketStatusListener
						ticketId={ticketId}
						initialStatus={status}
					/>
				)}
			</div>
			</CardHeader>
			<CardContent>
			<ItemsBody
				items={items}
				status={status}
				ocrError={ocrError}
				selection={selection}
				canSelect={canSelect}
				triage={triage}
			/>
			</CardContent>
		</Card>
			{/* Card clips its surface; selection actions must keep the page as their sticky/fixed scroll context. */}
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
        <EmptyState
            testId='ticket-no-items'
            media={<RowIcon icon={PackageSearchIcon} tone='warning' size='empty' testId='ticket-no-items-icon' />}
            title='No items detected'
            description='We couldn?t find items in this receipt. Upload a new receipt with a clearer photo, or read this receipt again.'
        >
			<ul
				aria-label='Tips for a clearer photo'
				className='flex w-full max-w-md flex-col gap-2.5 rounded-2xl bg-muted p-3.5 text-left dark:bg-muted/50'
			>
				{TIPS.map(tip => (
					<li
						key={tip}
						className='flex items-start gap-2.5 text-sm leading-[1.4] text-muted-foreground dark:text-foreground/80'
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
		</EmptyState>
	)
}

export function TicketProcessingError({ compact = false }: { compact?: boolean } = {}) {
	const errorTitle = 'Failed to Process Receipt'
	const errorMessage = 'Unable to extract items from this receipt.'

	return (
		<div data-testid='ticket-processing-error' className={compact ? 'pt-4 pb-3' : 'py-8'}>
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
