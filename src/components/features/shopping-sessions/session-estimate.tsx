import { formatCurrency } from '@/utils'
import { Card } from '@/components/ui/card'

interface SessionEstimateProps {
	/** The sum of the average prices the list knows for this trip's items. */
	total: number
	pricedCount: number
	itemCount: number
	completed?: boolean
}

/**
 * What the trip would cost going by past receipts, next to the progress card (same surface and mono numerals). It says
 * "Estimated" and how many items it covers, so it can never read as what was paid; with no priced item it draws nothing.
 */
export function SessionEstimate({ total, pricedCount, itemCount, completed = false }: SessionEstimateProps) {
	if (pricedCount <= 0) return null

	return (
		<Card
			size='receipt'
			aria-label='Estimated total'
			data-testid='session-estimate-card'
		>
			<div className='flex flex-wrap items-end justify-between gap-3'>
			<div className='flex min-w-0 flex-col gap-1'>
				<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>{completed ? 'Estimated' : 'Estimated total'}</span>
			<span className='font-mono text-2xl leading-none font-semibold tracking-tight text-foreground tabular-nums'>
				{completed ? '≈ ' : ''}{formatCurrency(total)}
			</span>
			</div>
			<span className='text-right text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
				{itemCount} {itemCount === 1 ? 'item' : 'items'} · {pricedCount} with known prices
			</span>
		</div>
		</Card>
	)
}
