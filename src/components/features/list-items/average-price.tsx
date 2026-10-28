import { formatCurrency, isUsablePrice } from '@/utils'

interface AveragePriceProps {
	/** The item's `average_price`. Anything that is not a real price (missing, zero) draws nothing, never "$0.00". */
	price?: number | null
	testId?: string
}

/**
 * What the household usually pays for an item, from its receipts: the amount in mono with tabular numerals (the receipt
 * row's price style) and a quiet "avg", so it never reads as a price that was paid. Used on base-list and session rows.
 */
export function AveragePrice({ price, testId = 'item-average-price' }: AveragePriceProps) {
	if (!isUsablePrice(price)) return null

	return (
		<span
			data-testid={testId}
			className='inline-flex shrink-0 items-baseline gap-1 text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'
		>
			<span className='sr-only'>Average price </span>
			<b className='font-mono font-semibold text-foreground tabular-nums'>{formatCurrency(price)}</b>
			<span aria-hidden='true'>avg</span>
		</span>
	)
}
