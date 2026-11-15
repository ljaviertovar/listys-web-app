'use client'

import { useId, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Invoice01Icon, Loading03Icon, Store03Icon } from '@hugeicons/core-free-icons'

import { ActionLink, DataFigure, DataLine, EmptyStateCard, EntityLabel, InlineCounter, RowIcon } from '@/components/commons'
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'
import { MAX_IMAGES_PER_TICKET, MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'

import { NoStoreBadge } from '../no-store-badge'
import { TicketStatusChip } from '../ticket-status-chip'
import { toTicketChipStatus } from '../helpers/ticket-status'
import { UploadAnotherTile } from '../upload/upload-another-tile'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'
import type { TicketListItemData } from './helpers/build-ticket-list-item'

type TicketCardProps = TicketListItemData

/** A receipt card keeps status with its title, the linked store in classification, and count/action in its footer. */
export function TicketCard({
	id,
	title,
	status,
	itemsCount,
	photoCount,
	uploadedLabel,
	totalLabel,
	storeName,
	storeConfirmed,
}: TicketCardProps) {
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
			<div className='pb-2.5'>
				<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
					<div className='flex min-w-0 items-center justify-between gap-2'>
						<h2 className='min-w-0 flex-1 truncate font-display text-base leading-normal font-semibold tracking-tight'>
							{title}
						</h2>
						<TicketStatusChip status={ticketStatus} />
					</div>
					{storeName || needsStore ? (
						<div className='flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5'>
							{storeName ? (
								<EntityLabel
									name={storeName}
									testId={`ticket-card-store-${id}`}
								/>
							) : null}
							{needsStore ? <NoStoreBadge testId={`ticket-card-no-store-${id}`} /> : null}
						</div>
					) : null}
					<TicketDataLine
						id={id}
						photoCount={photoCount}
						uploadedLabel={uploadedLabel}
						totalLabel={totalLabel}
					/>
				</div>
			</div>

			{ticketStatus === 'processing' ? (
				<CardFooter variant='status' inset='compact'>
					<Progress
						indeterminate
						size='sm'
						tone='track'
						aria-label='Reading receipt'
					/>
					<p className='text-xs leading-normal text-muted-foreground'>Reading store and items…</p>
				</CardFooter>
			) : (
				<CardFooter variant='summary' inset='compact'>
					{ticketStatus === 'pending' ? (
						<span className='flex items-center gap-2 text-xs text-muted-foreground'>
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={1.8}
								className='size-3.5'
								aria-hidden='true'
							/>
							Waiting in line to be read
						</span>
					) : null}
					{ticketStatus === 'failed' ? (
						<span className='flex items-center gap-2 text-xs text-feedback-error'>
							<HugeiconsIcon
								icon={Alert02Icon}
								strokeWidth={1.8}
								className='size-3.5'
								aria-hidden='true'
							/>
							Couldn’t read this receipt
						</span>
					) : null}
					{ticketStatus === 'completed' ? (
						<InlineCounter
							count={itemsCount ?? 0}
							one='item'
							many='items'
							testId={`ticket-card-count-${id}`}
						/>
					) : null}
					{showDetails ? (
						<ActionLink
							href={`/tickets/${id}`}
							testId={`ticket-details-${id}`}
							className='shrink-0'
						>
							View Details
						</ActionLink>
					) : null}
				</CardFooter>
			)}
		</Card>
	)
}

function TicketDataLine({
	id,
	photoCount,
	uploadedLabel,
	totalLabel,
}: Pick<TicketCardProps, 'id' | 'photoCount' | 'uploadedLabel' | 'totalLabel'>) {
	return (
				<div className='flex flex-col gap-1'>
					{totalLabel ? <DataFigure emphasis='total'>{totalLabel}</DataFigure> : null}
					<DataLine testId={`ticket-data-${id}`}>
						{photoCount > 0 ? (
							<>
								<DataFigure emphasis='count'>{photoCount}</DataFigure> {photoCount === 1 ? 'photo' : 'photos'}
							</>
						) : null}
						{uploadedLabel}
					</DataLine>
				</div>
	)
}

/** The receipts screen before the first upload: one message and the one primary action, with the limits spelled out. */
export function TicketsEmptyState() {
    return (
        <EmptyStateCard
            icon={Invoice01Icon}
            title='No receipts yet'
            description='Upload your first receipt to get started.'
            testId='tickets-empty-state'
        >
            <UploadTicketDialog className='w-auto' />
            <p className='font-mono text-xs text-muted-foreground'>
                1?{MAX_IMAGES_PER_TICKET} photos ? PNG or JPG ? {MAX_TICKET_IMAGE_MB} MB each
            </p>
        </EmptyStateCard>
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
	return <TicketsContent tickets={tickets} />
}

function TicketsContent({ tickets }: TicketsListProps) {
	const storeLabelId = useId()
	const storeFilterAnchor = useComboboxAnchor()
	const [storeFilter, setStoreFilter] = useState('all')
	const stores = [...new Set(tickets.flatMap(ticket => (ticket.storeName ? [ticket.storeName] : [])))].sort((a, b) =>
		a.localeCompare(b),
	)
	const hasUnconfirmedStore = tickets.some(
		ticket => !ticket.storeConfirmed && toTicketChipStatus(ticket.status, ticket.itemsCount) === 'completed',
	)
	const storeOptions = [
		{ value: 'all', label: 'All Stores', testId: 'tickets-store-option-icon-all' },
		...stores.map(store => ({ value: store, label: store, testId: `tickets-store-option-icon-${store}` })),
		...(hasUnconfirmedStore ? [{ value: 'unconfirmed', label: 'No store confirmed', testId: 'tickets-store-option-icon-unconfirmed' }] : []),
	]
	const filtered = tickets.filter(ticket => {
		const matchesStore =
			storeFilter === 'all' ||
			(storeFilter === 'unconfirmed' ? !ticket.storeConfirmed : ticket.storeName === storeFilter)
		return matchesStore
	})

	return (
		<div
			className='flex flex-col gap-3'
			data-testid='tickets-content'
		>
			<div
				className='flex flex-col gap-3'
				data-testid='tickets-filters'
			>
				<div className='flex flex-col gap-1.5'>
					<Label htmlFor={storeLabelId}>Show receipts from store:</Label>
					<Combobox
						items={storeOptions.map(option => option.value)}
						itemToStringLabel={value => storeOptions.find(option => option.value === value)?.label ?? ''}
						filter={(value, query, getLabel) => (getLabel?.(value) ?? String(value)).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
						value={storeFilter}
						onValueChange={value => typeof value === 'string' && setStoreFilter(value)}
					>
						<div className='w-full' ref={storeFilterAnchor}>
						<ComboboxInput
							id={storeLabelId}
							size='filter'
							surface='page'
							inset='card'
							aria-label='Filter by store'
							showClear={false}
							data-testid='tickets-store-filter'
						>
							<InputGroupAddon align='inline-start'>
								<RowIcon
									icon={Store03Icon}
									tone='store'
									size='xs'
									testId='tickets-store-filter-icon'
								/>
							</InputGroupAddon>
						</ComboboxInput>
						</div>
						<ComboboxContent size='filter' placement='below' anchor={storeFilterAnchor}>
							<ComboboxList>
								{(value: string) => {
									const option = storeOptions.find(candidate => candidate.value === value)
									if (!option) return null
									return (
										<ComboboxItem key={option.value} value={option.value} size='filter'>
											<span className='flex items-center gap-2.5'>
										<RowIcon
											icon={Store03Icon}
											tone='store'
											size='xs'
											testId={option.testId}
										/>
										{option.label}
									</span>
										</ComboboxItem>
									)
								}}
							</ComboboxList>
							<ComboboxEmpty>No stores match this search.</ComboboxEmpty>
						</ComboboxContent>
					</Combobox>
				</div>
			</div>
			{filtered.length ? (
				<ul
					data-testid='tickets-list'
					className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
				>
					{filtered.map(ticket => (
						<li key={ticket.id}>
							<TicketCard {...ticket} />
						</li>
					))}
					<li className='hidden md:block'>
						<UploadAnotherTile />
					</li>
				</ul>
			) : (
				<Card
					size='receipt'
					className='items-center text-center'
					data-testid='tickets-filter-empty'
				>
					<h2 className='font-display text-base font-semibold'>No receipts match these filters</h2>
					<Button
						type='button'
						variant='link'
						size='default'
						onClick={() => setStoreFilter('all')}
					>
						Clear filter
					</Button>
				</Card>
			)}
		</div>
	)
}
