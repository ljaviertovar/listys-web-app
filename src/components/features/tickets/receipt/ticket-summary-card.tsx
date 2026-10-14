import { cn, formatCurrency } from '@/utils'
import type { Ticket } from '@/types'

import { TicketActions } from './ticket-actions'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'

interface Props {
	ticket: Ticket
	itemsCount: number
	/** Items that carry a price, so the total can say how much of the receipt it covers. */
	pricedItemsCount: number
	total: number
}

/** How many items were read and what they add up to, with the receipt's own actions (retry, delete) underneath. */
export function TicketSummaryCard({ ticket, itemsCount, pricedItemsCount, total }: Props) {
	const showTotals = ticket.ocr_status === 'completed' && itemsCount > 0
	// Read but empty: the way out is a better photo or another read, before deleting.
	const noItems = ticket.ocr_status === 'completed' && itemsCount === 0

	return (
		<section
			data-testid='ticket-summary-card'
			aria-label='Receipt summary'
			className={cn('flex flex-col px-4 pb-4', noItems ? 'pt-4' : 'pt-2', 'rounded-3xl bg-card shadow-card')}
		>
			{showTotals ? (
				<>
					<div className='flex min-h-12 items-center justify-between text-sm text-slate-500 dark:text-muted-foreground'>
						<span>Extracted items</span>
						<b className='font-mono font-semibold text-foreground tabular-nums'>{itemsCount}</b>
					</div>
					<div className='flex min-h-12 items-center justify-between border-t border-slate-100 text-sm font-semibold dark:border-border'>
						<span>Calculated total</span>
						<b className='font-mono text-xl leading-none font-bold tabular-nums'>{formatCurrency(total)}</b>
					</div>
					{pricedItemsCount < itemsCount ? (
						<p className='pb-2 text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
							Calculated using {pricedItemsCount} of {itemsCount} items with price.
						</p>
					) : null}
				</>
			) : null}
			<div className={cn('flex flex-col gap-2', showTotals && 'mt-2')}>
				{noItems ? (
					<UploadTicketDialog
						label='Upload a Clearer Photo'
						className='w-full'
					/>
				) : null}
				<TicketActions
					ticket={ticket}
					allowRetry={noItems}
				/>
			</div>
		</section>
	)
}
