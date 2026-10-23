import { formatCurrency } from '@/utils'

interface SessionEstimateProps {
	/** The sum of the average prices the list knows for this trip's items. */
	total: number
	pricedCount: number
	itemCount: number
}

/**
 * What the trip would cost going by past receipts, next to the progress card (same surface and mono numerals). It says
 * "Estimated" and how many items it covers, so it can never read as what was paid; with no priced item it draws nothing.
 */
export function SessionEstimate({ total, pricedCount, itemCount }: SessionEstimateProps) {
	if (pricedCount <= 0) return null

	return (
		<section
			aria-label='Estimated total'
			data-testid='session-estimate-card'
			className='flex items-end justify-between gap-3 rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			<div className='flex min-w-0 flex-col gap-1'>
				<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>Estimated total</span>
				<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>
					Based on <b className='font-mono font-semibold text-foreground tabular-nums'>{pricedCount}</b> of{' '}
					<b className='font-mono font-semibold text-foreground tabular-nums'>{itemCount}</b> {itemCount === 1 ? 'item' : 'items'} with a known price
				</span>
			</div>
			<span className='font-mono text-2xl leading-none font-semibold tracking-tight text-foreground tabular-nums'>
				{formatCurrency(total)}
			</span>
		</section>
	)
}
