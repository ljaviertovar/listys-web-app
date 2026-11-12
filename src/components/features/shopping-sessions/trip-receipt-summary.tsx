'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Attachment01Icon } from '@hugeicons/core-free-icons'
// AttachmentIcon and AttachmentOffIcon exist only in Hugeicons 4; every other icon stays on 3.x so none of them is redrawn.
import { AttachmentIcon, AttachmentOffIcon } from '@hugeicons/core-free-icons-v4'

import { CategorySection, EntityLabel } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NoStoreBadge, UploadTicketDialog } from '@/components/features/tickets'
import { TicketStatusChip } from '@/components/features/tickets/ticket-status-chip'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'
import { toTicketChipStatus, toTicketStatus } from '@/components/features/tickets/helpers/ticket-status'

import { summarizeTripReceipts, type TripReceiptEntry } from './helpers/summarize-trip-receipts'
import { TripReceiptDetailsSheet } from './trip-receipt-details-sheet'
import { TripReceiptReview } from './trip-receipt-review'
import { TripReceiptReadingListener } from './trip-receipt-reading-listener'

type TripReceiptSummaryProps = {
	receipts: TripReceiptEntry[]
	itemCount: number
	trip?: TicketSessionCandidate
	testId?: string
} & (
	| { mode: 'active'; estimate?: never }
	| { mode: 'completed'; estimate?: number | null }
)

export function TripReceiptSummary({
	receipts,
	mode,
	itemCount,
	estimate,
	trip,
	testId = 'session-receipt-summary',
}: TripReceiptSummaryProps) {
	const [reviewId, setReviewId] = useState<string | null>(null)
	const [viewId, setViewId] = useState<string | null>(null)
	const [failedId, setFailedId] = useState<string | null>(null)
	const summary = summarizeTripReceipts(receipts)
	const active = mode === 'active'
	const showPaidSummary = !active || receipts.length > 0
	const paid = summary.hasCompleteTotals || (active && summary.attachedCount === 0) ? formatCurrency(summary.paid) : '—'
	const details = active
		? `${summary.count} ${summary.count === 1 ? 'receipt' : 'receipts'} · ${summary.toReview} to review`
		: `${itemCount} ${itemCount === 1 ? 'item' : 'items'}${summary.storeCount ? ` · ${summary.storeCount} ${summary.storeCount === 1 ? 'store' : 'stores'}` : ''}`

	const receiptRows = receipts.map(receipt => {
		const status = toTicketStatus(receipt.ocr_status, receipt.items_count)
		const chipStatus = toTicketChipStatus(receipt.ocr_status, receipt.items_count)
		const action = receipt.attached ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='link-inline'
					rounded='lg'
				onClick={() => setViewId(receipt.id)}
			>
				View Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : trip && status === 'completed' ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='link-inline'
					rounded='lg'
				onClick={() => setReviewId(receipt.id)}
			>
				Review Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : trip && status === 'failed' ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='link-inline'
					rounded='lg'
				onClick={() => setFailedId(receipt.id)}
			>
				Review Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : null

		return (
			<li key={receipt.id} data-testid={`trip-receipt-${receipt.id}`} className='py-3'>
				<div className='flex min-w-0 flex-col gap-2'>
					<div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2'>
						<p className='min-w-0 break-words text-sm leading-[1.3] font-semibold'>Receipt</p>
						<TicketStatusChip status={chipStatus} testId={`trip-receipt-status-${receipt.id}`} />
					</div>
					<div data-testid={`trip-receipt-classification-${receipt.id}`} className='flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5'>
						{receipt.store ? (
							<EntityLabel name={receipt.store.name} testId={`trip-receipt-store-${receipt.id}`} />
						) : (
							<NoStoreBadge testId={`trip-receipt-store-${receipt.id}`} />
						)}
						{receipt.attached ? (
							<Badge data-testid={`trip-receipt-attachment-${receipt.id}`} variant='tag'>
								<HugeiconsIcon icon={AttachmentIcon} aria-hidden='true' strokeWidth={1.8} />
								Receipt attached
							</Badge>
						) : (
							<Badge data-testid={`trip-receipt-attachment-${receipt.id}`} variant='tag-attention'>
								<HugeiconsIcon icon={AttachmentOffIcon} strokeWidth={1.8} aria-hidden='true' />
								No Receipt attached
							</Badge>
						)}
					</div>
					<div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2'>
						<p data-testid={`trip-receipt-data-${receipt.id}`} className='text-sm leading-[1.2] text-body dark:text-muted-foreground'>
							<b className='font-mono text-base font-bold text-foreground tabular-nums'>{receipt.items_count}</b>{' '}
							{receipt.items_count === 1 ? 'item' : 'items'} · {receipt.total_amount == null ? '—' : formatCurrency(receipt.total_amount)}
						</p>
						{action}
					</div>
					{!receipt.attached && status !== 'completed' && status !== 'failed' ? (
						<TripReceiptReadingListener ticketId={receipt.id} />
					) : null}
				</div>
			</li>
		)
	})

	const header = (
		<div className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
			<div className='flex min-w-0 flex-col gap-1'>
				<h2 className='font-sans text-xs leading-[1.3] font-normal text-muted-foreground dark:text-muted-foreground'>{active ? 'Paid so far' : 'Paid'}</h2>
				<p className='font-mono text-2xl font-semibold tabular-nums tracking-tight'>{paid}</p>
			</div>
			<div className='flex max-w-40 flex-col items-end gap-1 text-right text-xs leading-normal text-muted-foreground dark:text-muted-foreground'>
				<p>{details}</p>
				{!active && estimate != null ? <p>Estimate was <span className='font-mono'>{formatCurrency(estimate)}</span></p> : null}
			</div>
		</div>
	)

	const dialogs = <>
		{trip && reviewId ? <TripReceiptReview key={reviewId} ticketId={reviewId} trip={trip} onClose={() => setReviewId(null)} /> : null}
		{viewId ? <TripReceiptDetailsSheet ticketId={viewId} open onOpenChange={open => { if (!open) setViewId(null) }} /> : null}
		{trip && failedId ? (
			<TripReceiptDetailsSheet
				ticketId={failedId}
				open
				failed
				returnHref={`/shopping/${trip.id}?details=1`}
				onOpenChange={open => { if (!open) setFailedId(null) }}
				testId='trip-failed-receipt-sheet'
			/>
		) : null}
	</>

	if (active && receipts.length === 0) return null

	return (
		<section data-testid={testId}>
			<Card size='receipt' data-testid='trip-receipts-card'>
				<div className='flex flex-col gap-4'>
					{showPaidSummary ? header : null}
					<CategorySection
						category='Receipts'
						title='Receipts'
						count={`${receipts.length} ${receipts.length === 1 ? 'receipt' : 'receipts'}`}
						tone='ocr'
						panelClassName='px-3'
						testId='trip-receipts-section'
					>
						<ul className='divide-y divide-slate-200/70 dark:divide-border' data-testid='trip-receipt-list'>
							{receiptRows}
						</ul>
					</CategorySection>
					{trip && !active ? (
						<UploadTicketDialog
							label='Attach Receipt'
							triggerIcon={Attachment01Icon}
							variant='secondary'
							size='primary'
							className='w-full'
							shoppingSessionId={trip.id}
						/>
					) : null}
				</div>
			</Card>
			{dialogs}
		</section>
	)
}
