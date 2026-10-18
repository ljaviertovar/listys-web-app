import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Invoice01Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils'
import { MAX_IMAGES_PER_TICKET, MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'

import { TicketStatusChip } from '../ticket-status-chip'
import { TICKET_STATUS_NOTE_ICON, toTicketStatus, type TicketStatus } from '../helpers/ticket-status'
import { UploadAnotherTile } from '../upload/upload-another-tile'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'

interface TicketCardProps {
	id: string
	storeName: string | null
	/** Raw `ocr_status` column; anything unknown reads as pending. */
	status: string | null
	itemsCount: number | null
	/** Already formatted on the server, so no date has to cross the client boundary. */
	uploadedLabel: string
}

const NOTE = 'text-sm leading-[1.3] text-slate-600 dark:text-muted-foreground'

function StatusNote({ status, itemsCount }: { status: TicketStatus; itemsCount: number }) {
	const noteIcon = TICKET_STATUS_NOTE_ICON[status]

	if (status === 'processing') {
		return (
			<div
				data-testid='ticket-card-progress'
				className='flex min-w-0 flex-1 flex-col gap-2'
			>
				<span
					role='progressbar'
					aria-label='Reading your receipt'
					className='block h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-muted'
				>
					<span className='block h-full w-2/5 animate-pulse rounded-full bg-blue-600 motion-reduce:animate-none' />
				</span>
				<span className={NOTE}>Reading your receipt...</span>
			</div>
		)
	}

	if (status === 'completed') {
		return (
			<span className={NOTE}>
				<b className='font-mono text-sm font-semibold text-foreground tabular-nums'>{itemsCount}</b>{' '}
				{itemsCount === 1 ? 'item' : 'items'}
			</span>
		)
	}

	return (
		<span className={cn('flex items-center gap-2', NOTE, status === 'failed' && 'font-medium text-red-700 dark:text-red-400')}>
			{noteIcon ? (
				<HugeiconsIcon
					icon={noteIcon}
					strokeWidth={1.8}
					className='size-4 shrink-0'
				/>
			) : null}
			{status === 'failed' ? 'Couldn’t read this receipt' : 'Waiting in line to be read'}
		</span>
	)
}

/** A receipt in the list: who it is, when it was uploaded, its status chip and one line about where it stands. */
export function TicketCard({ id, storeName, status, itemsCount, uploadedLabel }: TicketCardProps) {
	const ticketStatus = toTicketStatus(status)
	// Only a receipt that has finished (or failed) has details worth a labelled link.
	const showDetails = ticketStatus === 'completed' || ticketStatus === 'failed'

	return (
		<article
			data-testid={`ticket-card-${id}`}
			data-status={ticketStatus}
			className='flex flex-col gap-2 rounded-3xl bg-card p-3 shadow-card md:gap-3 md:p-4'
		>
			<div className='flex items-start gap-3'>
				<span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'>
					<HugeiconsIcon
						icon={Invoice01Icon}
						strokeWidth={1.5}
						className='size-4.5'
					/>
				</span>
				<div className='flex min-w-0 flex-1 flex-col gap-2'>
					<div className='flex min-h-6.5 items-center justify-between gap-2'>
						<h2 className='min-w-0 truncate font-display text-base leading-normal font-semibold '>
							{storeName || 'Store not recognized'}
						</h2>
						<TicketStatusChip status={ticketStatus} />
					</div>
					<p className='font-mono text-xs leading-[1.4] font-medium text-slate-500 tabular-nums dark:text-muted-foreground'>
						{uploadedLabel}
					</p>
				</div>
			</div>

			<div className='flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-border'>
				<StatusNote
					status={ticketStatus}
					itemsCount={itemsCount ?? 0}
				/>
				{showDetails ? (
					<Link
						href={`/tickets/${id}`}
						data-testid={`ticket-details-${id}`}
						className='group/ticket-details inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg font-display text-sm font-semibold text-blue-700 focus-ring dark:text-blue-400'
					>
						View Details
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 transition-transform group-hover/ticket-details:translate-x-0.5 motion-reduce:transition-none'
						/>
					</Link>
				) : null}
			</div>
		</article>
	)
}

/** The receipts screen before the first upload: one message and the one primary action, with the limits spelled out. */
export function TicketsEmptyState() {
	return (
		<section
			data-testid='tickets-empty-state'
			aria-labelledby='tickets-empty-title'
			className='flex flex-col items-center gap-4 rounded-3xl bg-card p-3 text-center shadow-card md:gap-5 md:p-4'
		>
			<span className='flex size-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 md:size-18 dark:bg-cyan-950 dark:text-cyan-300'>
				<HugeiconsIcon
					icon={Invoice01Icon}
					strokeWidth={1.5}
					className='size-8'
				/>
			</span>
			<div className='flex flex-col gap-1'>
				<h2
					id='tickets-empty-title'
					className='font-display text-lg leading-[1.3] font-bold '
				>
					No receipts yet
				</h2>
				<p className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
					Upload your first receipt to get started.
				</p>
			</div>
			<UploadTicketDialog className='w-auto' />
			<p className='font-mono text-xs leading-[1.3] font-medium text-slate-500 dark:text-muted-foreground'>
				1–{MAX_IMAGES_PER_TICKET} photos · PNG or JPG · {MAX_TICKET_IMAGE_MB} MB each
			</p>
		</section>
	)
}

export type TicketsListItem = TicketCardProps

interface TicketsListProps {
	tickets: TicketsListItem[]
}

/**
 * The receipts screen's content: the one empty state before the first upload, then a grid of receipt cards (two columns from `sm`,
 * three from `xl`) ending with the "Upload Another Receipt" tile from `md`. The cards and the empty state are its visual children.
 */
export function TicketsList({ tickets }: TicketsListProps) {
	if (tickets.length === 0) return <TicketsEmptyState />

	return (
		<ul
			data-testid='tickets-list'
			className='grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
		>
			{tickets.map(ticket => (
				<li key={ticket.id}>
					<TicketCard {...ticket} />
				</li>
			))}
			<li className='hidden md:block'>
				<UploadAnotherTile />
			</li>
		</ul>
	)
}
