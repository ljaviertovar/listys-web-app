'use client'

import { SheetDialog } from '@/components/commons'
import { formatCurrency, formatDate } from '@/utils'

import type { StorePriceEntry } from './helpers/item-store-summary'
import { compareStorePrices } from './helpers/compare-store-prices'

export function ItemStorePricesSheet({
	open,
	onOpenChange,
	itemName,
	prices,
	testId,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	itemName: string
	prices: StorePriceEntry[]
	testId: string
}) {
	const comparison = compareStorePrices(prices)
	return (
		<SheetDialog
			open={open}
			onOpenChange={onOpenChange}
			title='Prices by Store'
			description={`Last receipt prices for ${itemName}.`}
			testId={testId}
		>
			<div className='flex flex-col gap-3' data-testid={`${testId}-content`}>
				{comparison.notComparable ? <p className='text-sm text-muted-foreground'>Some prices use different units and can’t be compared.</p> : null}
				<ul className='flex max-h-[min(60vh,480px)] flex-col gap-2 overflow-y-auto'>
					{prices.map(entry => {
						const cheapest = entry.store.id === comparison.cheapestStoreId
						const quantity = entry.last_quantity
						const unit = entry.last_unit?.trim() || 'each'
						const hasContext = quantity !== null && quantity > 0 && (quantity !== 1 || unit.toLowerCase() !== 'each')
						return (
							<li key={entry.store.id} data-testid={`${testId}-store-${entry.store.id}`} className='flex min-w-0 items-center gap-3 rounded-2xl bg-muted p-3'>
								<div className='flex min-w-0 flex-1 flex-col gap-1'>
									<div className='flex min-w-0 flex-wrap items-center gap-2'>
										<span className='min-w-0 flex-1 truncate text-sm font-semibold' title={entry.store.name}>{entry.store.name}</span>
										{cheapest ? <span className='shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800'>Lowest on last receipts</span> : null}
									</div>
									<p className='text-xs text-muted-foreground'>{entry.last_price_at ? formatDate(new Date(entry.last_price_at)) : 'Date unavailable'}</p>
									{hasContext ? <p className='text-xs text-muted-foreground'>{quantity} {unit}</p> : null}
								</div>
								<div className='shrink-0 text-right'>
									<p className='font-mono text-sm font-semibold tabular-nums'>{formatCurrency(entry.last_price)}</p>
									{hasContext && quantity ? <p className='text-xs text-muted-foreground'>{formatCurrency(entry.last_price / quantity)} / {unit}</p> : null}
								</div>
							</li>
						)
					})}
				</ul>
			</div>
		</SheetDialog>
	)
}
