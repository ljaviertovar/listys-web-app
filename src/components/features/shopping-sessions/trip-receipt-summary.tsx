'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Attachment01Icon, Invoice01Icon } from '@hugeicons/core-free-icons'

import { DataFigure, DataLine, RowIcon } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import { TicketStatusChip } from '@/components/features/tickets/ticket-status-chip'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'
import { toTicketStatus } from '@/components/features/tickets/helpers/ticket-status'

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
	const showPaidSummary = !active || summary.attachedCount > 0
	const paid = summary.hasCompleteTotals || (active && summary.attachedCount === 0) ? formatCurrency(summary.paid) : '—'
	const details = active
		? `${summary.count} ${summary.count === 1 ? 'receipt' : 'receipts'} · ${summary.toReview} to review`
		: `${itemCount} ${itemCount === 1 ? 'item' : 'items'}${summary.storeCount ? ` · ${summary.storeCount} ${summary.storeCount === 1 ? 'store' : 'stores'}` : ''}`

	const receiptRows = receipts.map(receipt => {
		const status = toTicketStatus(receipt.ocr_status, receipt.items_count)
		const action = receipt.attached ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='touch'
				onClick={() => setViewId(receipt.id)}
			>
				View Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : trip && status === 'completed' ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='touch'
				onClick={() => setReviewId(receipt.id)}
			>
				Review Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : trip && status === 'failed' ? (
			<Button
				type='button'
				variant='ghost-primary'
				size='touch'
				onClick={() => setFailedId(receipt.id)}
			>
				Review Receipt
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
			</Button>
		) : null

		return (
			<Card key={receipt.id} data-testid={`trip-receipt-${receipt.id}`} variant='stat' size='stat' tone='muted'>
				<div className='grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-2'>
					<RowIcon icon={Invoice01Icon} tone='ocr' size='md' testId={`trip-receipt-icon-${receipt.id}`} />
					<div className='flex min-w-0 flex-col gap-1'>
						<p data-testid={`trip-receipt-store-${receipt.id}`} className='break-words text-sm font-semibold'>
							{receipt.store?.name ?? 'Store not confirmed'}
						</p>
						<div className='flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1'>
							{receipt.attached ? (
								<div>
									<Badge variant='tag'>
										<HugeiconsIcon icon={Attachment01Icon} aria-hidden='true' strokeWidth={1.8} />
										Attached to trip
									</Badge>
								</div>
							) : (
								<TicketStatusChip
									status={status}
									label={status === 'pending' || status === 'processing' ? 'Processing' : status === 'completed' ? 'Ready for Review' : 'Failed'}
									testId={`trip-receipt-status-${receipt.id}`}
								/>
							)}
							{action ? <div className='shrink-0'>{action}</div> : null}
						</div>
						<DataLine testId={`trip-receipt-data-${receipt.id}`}>
							<span>
								<span className='font-semibold text-foreground'>{receipt.items_count}</span>{' '}
								{receipt.items_count === 1 ? 'item' : 'items'}
							</span>
							<DataFigure>{receipt.total_amount == null ? '—' : formatCurrency(receipt.total_amount)}</DataFigure>
						</DataLine>
					</div>
					{!receipt.attached && status !== 'completed' && status !== 'failed' ? (
						<TripReceiptReadingListener ticketId={receipt.id} />
					) : null}
				</div>
			</Card>
		)
	})

	const header = (
		<div className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
			<div className='flex min-w-0 flex-col gap-1'>
				<h2 className='text-sm font-semibold text-slate-500 dark:text-muted-foreground'>{active ? 'Paid so far' : 'Paid'}</h2>
				<p className='font-mono text-2xl font-semibold tabular-nums tracking-tight'>{paid}</p>
			</div>
			<div className='flex max-w-40 flex-col items-end gap-1 text-right text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
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
			{showPaidSummary ? (
				<Card size='receipt'>
					<div className='flex flex-col gap-4'>
						{header}
						<div className='flex flex-col gap-2'>{receiptRows}</div>
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
			) : <div className='flex flex-col gap-2'>{receiptRows}</div>}
			{dialogs}
		</section>
	)
}
