import { WarningAlert } from '@/components/commons'
import { AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils'
import type { Ticket } from '@/types'

import { TicketActions } from './ticket-actions'
import { UploadTicketDialog } from '../upload/upload-ticket-dialog'

/** Taxes and discounts make the printed total differ a little from the lines; a gap beyond this share means lines were likely missed. */
const TOTAL_GAP_RATIO = 0.1

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
	const showReceiptTotal = ticket.ocr_status === 'completed' && typeof ticket.total_amount === 'number'
	// Read but empty: the way out is a better photo or another read, before deleting.
	const noItems = ticket.ocr_status === 'completed' && itemsCount === 0
	const receiptTotal = ticket.total_amount ?? 0
	const linesMissed = showTotals && showReceiptTotal && total < receiptTotal * (1 - TOTAL_GAP_RATIO)

	return (
		<Card
			data-testid='ticket-summary-card'
			role='region'
			aria-label='Receipt summary'
			size='receipt'
		>
			<div className='flex flex-col gap-3'>
				{showTotals ? (
					<>
						<div className='flex items-center justify-between gap-3 text-sm leading-[1.3] text-muted-foreground dark:text-muted-foreground'>
							<span>Extracted items</span>
							<b className='font-mono font-medium whitespace-nowrap text-foreground tabular-nums'>{itemsCount}</b>
						</div>
						<div className='border-t border-slate-100 dark:border-border' />
						<div className='flex items-center justify-between gap-3 text-sm leading-[1.3] font-semibold'>
							<span>Extracted Item Total</span>
							<b className='font-mono text-base font-medium whitespace-nowrap tabular-nums'>{formatCurrency(total)}</b>
						</div>
					</>
				) : null}
				{showReceiptTotal ? (
					<>
						{showTotals ? <div className='border-t border-slate-100 dark:border-border' /> : null}
						<div className='flex items-center justify-between gap-3 text-sm leading-[1.3] font-semibold'>
							<span>Receipt Total</span>
							<b className='font-mono text-base font-medium whitespace-nowrap tabular-nums'>{formatCurrency(receiptTotal)}</b>
						</div>
					</>
				) : null}
				{linesMissed ? (
					<WarningAlert role='note' testId='ticket-total-gap-note' iconTestId='ticket-total-gap-icon'>
						<AlertDescription>The items we read add up to less than the receipt total. Some lines may be missing: check the photo.</AlertDescription>
					</WarningAlert>
				) : null}
				{showTotals && !linesMissed && pricedItemsCount < itemsCount ? (
					<p className='text-xs leading-normal text-muted-foreground dark:text-muted-foreground'>
						Based on prices found for {pricedItemsCount} of {itemsCount} items. This may differ from the total printed on your receipt.
					</p>
				) : null}
				{noItems ? (
					<UploadTicketDialog
						label='Upload a New Receipt'
						className='w-full'
					/>
				) : null}
				<TicketActions
					ticket={ticket}
					allowRetry={noItems}
				/>
			</div>
		</Card>
	)
}
