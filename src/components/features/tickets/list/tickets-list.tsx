'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon, Store03Icon } from '@hugeicons/core-free-icons'

import {
	ActionLink,
	DataFacts,
	DataFigure,
	EmptyStateCard,
	InlineCounter,
	OBJECT_CARD_LINK,
	ObjectCardBody,
	ObjectCardChips,
	ObjectCardFigure,
	ObjectCardFooter,
	ObjectCardTitleRow,
	RowIcon,
} from '@/components/commons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'
import { MAX_IMAGES_PER_TICKET, MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'

import { NoStoreBadge } from '../no-store-badge'
import { ReceiptDateFacts } from '../receipt/receipt-date-facts'
import { useTicketStatus } from '../receipt/hooks/use-ticket-status'
import { TicketStatusChip } from '../ticket-status-chip'
import { TicketSpendingMarker } from '../ticket-spending-marker'
import { toTicketChipStatus } from '../helpers/ticket-status'
import { UploadAnotherTile } from '../upload/upload-another-tile'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'
import type { TicketListItemData } from './helpers/build-ticket-list-item'

type TicketCardProps = TicketListItemData

/**
 * A receipt card (object card, canvas C1): its status beside the title (which already names the store), the notice for a receipt
 * still without a store, the amount with its data line, and count and link in the footer. The footer link covers the whole card.
 */
export function TicketCard({
	id,
	title,
	status,
	itemsCount,
	photoCount,
	uploadedAt,
	purchaseDate,
	totalLabel,
	storeConfirmed,
	includedInSpending,
}: TicketCardProps) {
	const router = useRouter()
	const ticketStatus = useTicketStatus({
		ticketId: id,
		initialStatus: toTicketChipStatus(status, itemsCount),
		onTerminal: () => router.refresh(),
	})
	// Only a receipt that has finished (or failed) has details worth a labelled link.
	const showDetails = ticketStatus === 'completed' || ticketStatus === 'failed'
	const needsStore = ticketStatus === 'completed' && !storeConfirmed

	return (
		<Card
			size='object'
			interactive={showDetails}
			data-testid={`ticket-card-${id}`}
			data-status={ticketStatus}
		>
			<ObjectCardBody>
				<ObjectCardTitleRow
					title={title}
					aside={<TicketStatusChip status={ticketStatus} />}
				/>
				{needsStore ? (
					<ObjectCardChips>
						<NoStoreBadge testId={`ticket-card-no-store-${id}`} />
					</ObjectCardChips>
				) : null}
				<TicketDataLine
					id={id}
					includedInSpending={includedInSpending}
					photoCount={photoCount}
					uploadedAt={uploadedAt}
					purchaseDate={purchaseDate}
					totalLabel={totalLabel}
				/>
			</ObjectCardBody>

			{ticketStatus === 'processing' ? (
				<ObjectCardFooter variant='status' spacing='roomy'>
					<Progress
						indeterminate
						size='sm'
						tone='track'
						aria-label='Reading receipt'
					/>
					<p className='text-xs leading-normal text-muted-foreground'>Reading receipt…</p>
				</ObjectCardFooter>
			) : (
				<ObjectCardFooter>
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
							aria-label={`View Details in ${title}`}
							testId={`ticket-details-${id}`}
							className={OBJECT_CARD_LINK}
							stretched
						>
							View Details
						</ActionLink>
					) : null}
				</ObjectCardFooter>
			)}
		</Card>
	)
}

function TicketDataLine({
	id,
	photoCount,
	uploadedAt,
	purchaseDate,
	totalLabel,
	includedInSpending,
}: Pick<TicketCardProps, 'id' | 'photoCount' | 'uploadedAt' | 'purchaseDate' | 'totalLabel' | 'includedInSpending'>) {
	return (
		<ObjectCardFigure>
			{totalLabel ? (
				// The marker says whether this amount counts, so it stands on the amount's row, at the far end.
				<div className='flex items-baseline justify-between gap-2'>
					<p>
						<DataFigure emphasis='total'>{totalLabel}</DataFigure>
					</p>
					{includedInSpending ? <TicketSpendingMarker testId={`ticket-card-spending-${id}`} /> : null}
				</div>
			) : null}
			<DataFacts
				testId={`ticket-data-${id}`}
				facts={[
					photoCount > 0 ? { kind: 'count', value: photoCount, unit: photoCount === 1 ? 'photo' : 'photos' } : null,
					{ value: <ReceiptDateFacts uploadedAt={uploadedAt} purchaseDate={purchaseDate} testId={`ticket-dates-${id}`} /> },
				]}
			/>
		</ObjectCardFigure>
	)
}

/** The receipts screen before the first upload: one message and the one primary action, with the limits spelled out. */
export function TicketsEmptyState() {
    return (
        <EmptyStateCard
            stub={{ label: 'Receipts', count: '0 receipts' }}
            title='No receipts yet'
            description='Upload your first receipt to get started.'
            testId='tickets-empty-state'
        >
            <UploadTicketDialog className='w-auto' />
            <p className='font-mono text-xs text-muted-foreground'>
                1–{MAX_IMAGES_PER_TICKET} photos · PNG or JPG · {MAX_TICKET_IMAGE_MB} MB each
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
		...(hasUnconfirmedStore ? [{ value: 'unconfirmed', label: 'Store not confirmed', testId: 'tickets-store-option-icon-unconfirmed' }] : []),
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
							<ComboboxEmpty>No stores available.</ComboboxEmpty>
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
						size='lg'
						onClick={() => setStoreFilter('all')}
					>
						Clear filter
					</Button>
				</Card>
			)}
		</div>
	)
}
