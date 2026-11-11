import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon } from '@hugeicons/core-free-icons'

import { ActionLink, DataFigure, DataLine, InlineCounter, RowIcon } from '@/components/commons'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils'
import { MAX_IMAGES_PER_TICKET, MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'

import { NoStoreBadge } from '../no-store-badge'
import { TicketStatusChip } from '../ticket-status-chip'
import { TICKET_STATUS_NOTE_ICON, toTicketChipStatus, type TicketStatus } from '../helpers/ticket-status'
import { UploadAnotherTile } from '../upload/upload-another-tile'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'
import type { TicketListItemData } from './helpers/build-ticket-list-item'

type TicketCardProps = TicketListItemData

const NOTE = 'text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'

function StatusNote({ status, itemsCount }: { status: TicketStatus; itemsCount: number }) {
	const noteIcon = TICKET_STATUS_NOTE_ICON[status]

	if (status === 'processing') {
		return (
			<div
				data-testid='ticket-card-progress'
				className='flex min-w-0 flex-1 flex-col gap-2'
			>
				<Progress
					indeterminate
					size='sm'
					tone='track'
					aria-label='Reading receipt'
				/>
				<span className={NOTE}>Reading store and items…</span>
			</div>
		)
	}

	if (status === 'completed') {
		return (
			<InlineCounter
				count={itemsCount}
				one='item'
				many='items'
				testId='ticket-card-count'
			/>
		)
	}

	return (
		<span className={cn('flex items-center gap-2', NOTE, status === 'failed' && 'font-medium text-red-700 dark:text-red-400')}>
			{noteIcon ? (
				<HugeiconsIcon
					icon={noteIcon}
					strokeWidth={1.5}
					className='size-4 shrink-0'
				/>
			) : null}
			{status === 'failed' ? 'Couldn’t read this receipt' : 'Waiting in line to be read'}
		</span>
	)
}

/** A receipt in the list: who it is, when it was uploaded, its status chip and one line about where it stands. */
export function TicketCard({ id, title, status, itemsCount, photoCount, uploadedLabel, totalLabel, storeConfirmed }: TicketCardProps) {
	const ticketStatus = toTicketChipStatus(status, itemsCount)
	// Only a receipt that has finished (or failed) has details worth a labelled link.
	const showDetails = ticketStatus === 'completed' || ticketStatus === 'failed'
	const needsStore = ticketStatus === 'completed' && !storeConfirmed

	return (
		<Card
			size='receipt'
			data-testid={`ticket-card-${id}`}
			data-status={ticketStatus}
		>
			<div className='flex items-center gap-3'>
				<RowIcon
					icon={Invoice01Icon}
					tone='ocr'
					size='md'
					testId={`ticket-card-icon-${id}`}
				/>
				<div className='flex min-w-0 flex-1 flex-col gap-1'>
					<div className='flex items-center justify-between gap-2'>
						<h2 className='min-w-0 truncate font-display text-base leading-normal font-semibold tracking-tight'>{title}</h2>
						<TicketStatusChip status={ticketStatus} />
					</div>
					<div className='flex flex-col items-start gap-1.5'>
						{needsStore ? (
							<NoStoreBadge testId={`ticket-card-no-store-${id}`} />
						) : null}
						<TicketDataLine id={id} storeConfirmed={storeConfirmed} photoCount={photoCount} uploadedLabel={uploadedLabel} totalLabel={totalLabel} />
					</div>
				</div>
			</div>

			<div className='mt-3 flex min-h-13 items-center justify-between gap-3 border-t border-slate-100 dark:border-border'>
				<StatusNote
					status={ticketStatus}
					itemsCount={itemsCount ?? 0}
				/>
				{showDetails ? (
					<ActionLink
						href={`/tickets/${id}`}
						testId={`ticket-details-${id}`}
						className='shrink-0'
					>
						View Details
					</ActionLink>
				) : null}
			</div>
		</Card>
	)
}

function TicketDataLine({ id, storeConfirmed, photoCount, uploadedLabel, totalLabel }: Pick<TicketCardProps, 'id' | 'storeConfirmed' | 'photoCount' | 'uploadedLabel' | 'totalLabel'>) {
	return (
		<DataLine testId={`ticket-data-${id}`}>
			{!storeConfirmed && photoCount > 0 ? (
				<>
					<DataFigure emphasis='count'>{photoCount}</DataFigure> {photoCount === 1 ? 'photo' : 'photos'}
				</>
			) : null}
			{uploadedLabel}
			{totalLabel ? <DataFigure>{totalLabel}</DataFigure> : null}
		</DataLine>
	)
}

/** The receipts screen before the first upload: one message and the one primary action, with the limits spelled out. */
export function TicketsEmptyState() {
	return (
		<Card
			size='receipt'
			data-testid='tickets-empty-state'
			aria-labelledby='tickets-empty-title'
			className='items-center text-center'
		>
			<RowIcon
				icon={Invoice01Icon}
				tone='primary'
				size='empty'
				testId='tickets-empty-icon'
			/>
			<h2
				id='tickets-empty-title'
				className='mt-4 font-display text-lg leading-[1.39] font-semibold tracking-[-0.01em]'
			>
				No receipts yet
			</h2>
			<p className='mt-1.5 max-w-65 text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
				Upload your first receipt to get started.
			</p>
			<UploadTicketDialog className='mt-5 w-auto' />
			<p className='mt-3 font-mono text-xs leading-[1.4] font-medium text-slate-500 dark:text-muted-foreground'>
				1–{MAX_IMAGES_PER_TICKET} photos · PNG or JPG · {MAX_TICKET_IMAGE_MB} MB each
			</p>
		</Card>
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
			className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
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
