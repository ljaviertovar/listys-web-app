'use client'

import { Store03Icon } from '@hugeicons/core-free-icons'
// AttachmentIcon and AttachmentOffIcon exist only in Hugeicons 4; every other icon stays on 3.x so none of them is redrawn.
import { AttachmentIcon, AttachmentOffIcon } from '@hugeicons/core-free-icons-v4'
import { HugeiconsIcon } from '@hugeicons/react'

import {
	ActionLink,
	DataFacts,
	DataFigure,
	EntityLabel,
	InlineCounter,
	OBJECT_CARD_LINK,
	ObjectCardBody,
	ObjectCardChips,
	ObjectCardFigure,
	ObjectCardFooter,
	ObjectCardTitleRow,
} from '@/components/commons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatTime, formatTripDate } from '@/utils'
import type { TripReceipt } from '@/types'
import { getTripStores } from './helpers/get-trip-stores'

interface Session {
	id: string
	name: string
	status: string | null
	started_at: string | null
	completed_at: string | null
	total_amount: number | null
	total_items?: number | null
	purchased_count?: number | null
	shopping_session_items?: Array<{ id: string; checked: boolean | null }> | null
	base_list: { name: string } | null
	store?: { id: string; name: string } | null
	receipts?: TripReceipt[]
}

interface Props {
	session: Session
	href?: string
}

/**
 * A completed trip in Trips (object card, canvas C1). Its levels, in order: identity with the one status pill (Completed), classification
 * (the store as an entity, then tags for the receipt), the amount with its data line and the footer. A trip without a receipt gets an
 * attention tag; adding one starts from the saved-trip screen. A trip whose receipt state is unknown (`receipt` omitted) shows no receipt
 * tag. The footer link covers the whole card.
 */
export function HistorySessionCard({ session, href }: Props) {
	const detailsHref = href ?? `/shopping/${session.id}`
	const receiptState = session.receipts === undefined ? 'unknown' : session.receipts.length ? 'attached' : 'none'
	const stores = getTripStores(session.store, session.receipts ?? [])
	const completedDate = session.completed_at ? new Date(session.completed_at) : null
	const purchasedCount =
		session.purchased_count ??
		(session.shopping_session_items
			? session.shopping_session_items.filter(i => i.checked === true).length
			: (session.total_items ?? null))
	const hasClassification = receiptState !== 'unknown' || Boolean(session.store)

	return (
		<Card
			size='object'
			interactive
			data-testid={`history-card-${session.id}`}
		>
			<ObjectCardBody>
				<ObjectCardTitleRow
					title={session.name}
					aside={
						<Badge
							variant='completed'
							dot
						>
							Completed
						</Badge>
					}
				/>

				{hasClassification ? (
					<ObjectCardChips>
						{stores[0] ? (
							<EntityLabel
								name={stores[0].name}
								testId={`history-store-${session.id}-${stores[0].id}`}
							/>
						) : null}
						{stores.length > 1 ? (
							<Badge variant='outline'>
								<HugeiconsIcon
									icon={Store03Icon}
									strokeWidth={1.8}
									aria-hidden='true'
								/>
								+{stores.length - 1} {stores.length === 2 ? 'store' : 'stores'}
							</Badge>
						) : null}
						{receiptState === 'attached' ? (
							<Badge
								data-testid={`history-receipt-marker-${session.id}`}
								variant='outline'
							>
								<HugeiconsIcon
									icon={AttachmentIcon}
									strokeWidth={1.8}
									aria-hidden='true'
								/>
								{(session.receipts?.length ?? 0) > 1
									? `${session.receipts?.length} receipts attached`
									: 'Receipt attached'}
							</Badge>
						) : null}
						{receiptState === 'none' ? (
							<Badge
								data-testid={`history-no-receipt-${session.id}`}
								variant='warning'
							>
								<HugeiconsIcon
									icon={AttachmentOffIcon}
									strokeWidth={1.8}
									aria-hidden='true'
								/>
								No receipt attached
							</Badge>
						) : null}
					</ObjectCardChips>
				) : null}

				<ObjectCardFigure testId={`history-data-${session.id}`}>
					{session.total_amount == null ? null : (
						<p data-testid={`history-total-${session.id}`}>
							<DataFigure emphasis='total'>{formatCurrency(session.total_amount)}</DataFigure>
						</p>
					)}
					<DataFacts
						testId={`history-date-${session.id}`}
						facts={
							completedDate
								? [{ value: formatTripDate(completedDate) }, { kind: 'clock', value: formatTime(completedDate) }]
								: [{ value: 'Date unknown' }]
						}
					/>
				</ObjectCardFigure>
			</ObjectCardBody>

			<ObjectCardFooter>
				{purchasedCount === null ? (
					<span className='text-sm leading-none text-muted-foreground'>Item count unavailable</span>
				) : (
					<InlineCounter
						count={purchasedCount}
						one='purchased item'
						many='purchased items'
						testId={`history-count-${session.id}`}
					/>
				)}
				<ActionLink
					href={detailsHref}
					aria-label={`View Details in ${session.name}`}
					className={OBJECT_CARD_LINK}
					stretched
				>
					View Details
				</ActionLink>
			</ObjectCardFooter>
		</Card>
	)
}
