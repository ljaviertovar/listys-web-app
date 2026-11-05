'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Attachment01Icon } from '@hugeicons/core-free-icons'

import { ActionLink, DataFigure, DataLine, EntityLabel } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'

import { summarizeTripReceipts, type TripReceiptEntry } from './helpers/summarize-trip-receipts'
import { TripReceiptReview } from './trip-receipt-review'
import { TripReceiptReadingListener } from './trip-receipt-reading-listener'

export function TripReceiptSummary({ receipts, active, itemCount, estimate, trip, fallbackTotal, testId = 'session-receipt-summary' }: {
	receipts: TripReceiptEntry[]
	active: boolean
	itemCount: number
	estimate?: number | null
	trip?: TicketSessionCandidate
	fallbackTotal?: number | null
	testId?: string
}) {
	const [reviewId, setReviewId] = useState<string | null>(null)
	const summary = summarizeTripReceipts(receipts)
	return (
		<Card size='receipt' data-testid={testId}>
			<div className='flex flex-col gap-4'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex flex-col gap-1'>
						<h2 className='text-sm font-semibold'>{active ? 'Paid so far' : 'Paid'}</h2>
						<p className='text-xs text-slate-500 dark:text-muted-foreground'>{active ? `${summary.count} ${summary.count === 1 ? 'receipt' : 'receipts'} · ${summary.toReview} to review` : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}${summary.storeCount ? ` · ${summary.storeCount} ${summary.storeCount === 1 ? 'store' : 'stores'}` : ''}`}</p>
						{!active && estimate != null ? <p className='text-xs text-slate-500 dark:text-muted-foreground'>Estimate was <span className='font-mono'>{formatCurrency(estimate)}</span></p> : null}
					</div>
					<span className='font-mono text-2xl font-semibold tabular-nums'>{summary.hasKnownTotal || active ? formatCurrency(summary.paid) : fallbackTotal != null ? formatCurrency(fallbackTotal) : '—'}</span>
				</div>
				<div className='divide-y divide-slate-100 dark:divide-border'>
					{receipts.map(receipt => <div key={receipt.id} data-testid={`trip-receipt-${receipt.id}`} className='flex flex-wrap items-center justify-between gap-3 py-3'>
						<div className='flex min-w-0 flex-col gap-1.5'>
							{receipt.store ? <EntityLabel name={receipt.store.name} testId={`trip-receipt-store-${receipt.id}`} /> : <span className='text-sm text-slate-500'>Store not confirmed</span>}
							<DataLine testId={`trip-receipt-data-${receipt.id}`}><span>{receipt.items_count} {receipt.items_count === 1 ? 'item' : 'items'}</span><DataFigure>{receipt.total_amount == null ? '—' : formatCurrency(receipt.total_amount)}</DataFigure></DataLine>
							{active && (receipt.attached || receipt.ocr_status === 'completed') ? <div><Badge variant={receipt.attached ? 'tag' : 'tag-attention'}><HugeiconsIcon icon={Attachment01Icon} aria-hidden='true' strokeWidth={1.8} />{receipt.attached ? 'Attached to trip' : 'Pending attachment'}</Badge></div> : null}
							{!receipt.attached && receipt.ocr_status !== 'completed' ? <p role='status' className='text-xs text-slate-500'>{receipt.ocr_status === 'failed' ? 'We couldn’t read this receipt' : 'Reading your receipt…'}</p> : null}
						</div>
						{receipt.attached ? <ActionLink href={`/tickets/${receipt.id}`}>View Receipt</ActionLink> : trip && receipt.ocr_status === 'completed' ? <Button type='button' variant='ghost-primary' size='touch' onClick={() => setReviewId(receipt.id)}>Review Receipt</Button> : null}
						{!receipt.attached && receipt.ocr_status !== 'completed' && receipt.ocr_status !== 'failed' ? <TripReceiptReadingListener ticketId={receipt.id} /> : null}
					</div>)}
				</div>
				{trip ? <UploadTicketDialog label='Add Another Receipt' variant='outline' shoppingSessionId={trip.id} /> : null}
				{trip && reviewId ? <TripReceiptReview key={reviewId} ticketId={reviewId} trip={trip} onClose={() => setReviewId(null)} /> : null}
			</div>
		</Card>
	)
}
