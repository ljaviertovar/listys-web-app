'use client'

import Link from 'next/link'
import { Alert02Icon, Attachment01Icon, ShoppingBag02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActionLink, DataFigure, DataLine, EntityLabel, InlineCounter } from '@/components/commons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatTripDate } from '@/utils'
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

/** The trip's own page with focus on the receipt card, keeping whatever the details link carries. */
function addReceiptHref(detailsHref: string) {
	return `${detailsHref}${detailsHref.includes('?') ? '&' : '?'}receipt=add`
}

/**
 * A completed trip in Trips (design: Mobile historial; canvas 4/7 data hierarchy). The card is plain; only its links react to taps or
 * hover. Its levels, in order: identity with the one status pill (Completed), classification (the store as an entity, then tags for the
 * receipt), the data line and the footer. A trip without a receipt gets an attention tag and a separate "Add Receipt" button: having no
 * receipt never makes the trip incomplete. A trip whose receipt state is unknown (`receipt` omitted) shows no receipt tag.
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
			: session.total_items ?? null)
	const hasClassification = receiptState !== 'unknown' || Boolean(session.store)

	return (
		<Card
			size='receipt'
			data-testid={`history-card-${session.id}`}
		>
			<div className='flex flex-col gap-2.5'>
				<div className='flex items-center gap-3'>
					<span
						aria-hidden='true'
						className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
					>
						<HugeiconsIcon
							icon={ShoppingBag02Icon}
							strokeWidth={1.5}
							className='size-4.5'
						/>
					</span>
					<h2 className='min-w-0 flex-1 truncate font-display text-base leading-normal font-semibold tracking-[-0.005em]'>{session.name}</h2>
					<Badge
						variant='completed'
						dot
					>
						Completed
					</Badge>
				</div>

				{hasClassification ? (
					<div className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>
						{stores.map(store => (
							<EntityLabel
								key={store.id}
								name={store.name}
								testId={`history-store-${session.id}-${store.id}`}
							/>
						))}
						{receiptState === 'attached' ? (
							<Badge
								data-testid={`history-receipt-marker-${session.id}`}
								variant='tag'
							>
								<HugeiconsIcon
									icon={Attachment01Icon}
									strokeWidth={1.8}
									aria-hidden='true'
								/>
								{(session.receipts?.length ?? 0) > 1 ? `${session.receipts?.length} receipts` : 'Receipt attached'}
							</Badge>
						) : null}
						{receiptState === 'none' ? (
							<Badge
								data-testid={`history-no-receipt-${session.id}`}
								variant='tag-attention'
							>
								<HugeiconsIcon
									icon={Alert02Icon}
									strokeWidth={1.8}
									aria-hidden='true'
								/>
								No receipt
							</Badge>
						) : null}
					</div>
				) : null}

				<DataLine testId={`history-data-${session.id}`}>
					{completedDate ? (
						<>
							<DataFigure>{formatTripDate(completedDate)}</DataFigure>
						</>
					) : (
						'Date unknown'
					)}
					{session.total_amount == null ? null : <DataFigure>{formatCurrency(session.total_amount)}</DataFigure>}
				</DataLine>

				<div className='flex items-center justify-between gap-2 border-t border-slate-100 pt-3'>
					{purchasedCount === null ? (
						<span className='text-sm leading-none text-slate-600'>Item count unavailable</span>
					) : (
						<InlineCounter
							count={purchasedCount}
							one='Purchased Item'
							many='Purchased Items'
							testId={`history-count-${session.id}`}
						/>
					)}
					<ActionLink href={detailsHref} aria-label={`View details for ${session.name}`} className='shrink-0'>
						View Details
					</ActionLink>
				</div>
				{receiptState === 'none' ? (
					<Button asChild size='primary' className='w-full sm:w-auto sm:self-start'>
						<Link href={addReceiptHref(detailsHref)} data-testid={`history-add-receipt-${session.id}`} aria-label={`Add a receipt to ${session.name}`}>
							Add Receipt
						</Link>
					</Button>
				) : null}
			</div>
		</Card>
	)
}
