import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ItemStorePrices } from '@/components/features/base-lists'

const MARKET_FRESH = { id: 'market-fresh', name: 'Market Fresh' }

// Noon UTC keeps each date on the same calendar day in every time zone the page is rendered in.
const HISTORY = [
	{ store: { id: 'freshco', name: 'FreshCo' }, last_price: 5.1, last_quantity: 12, last_unit: 'unit', last_price_at: '2026-10-12T12:00:00Z', purchase_count: 1 },
	{ store: MARKET_FRESH, last_price: 4.8, last_quantity: 12, last_unit: 'unit', last_price_at: '2026-11-18T12:00:00Z', purchase_count: 6 },
	{ store: { id: 'no-frills', name: 'No Frills' }, last_price: 4.29, last_quantity: 12, last_unit: 'unit', last_price_at: '2026-11-04T12:00:00Z', purchase_count: 3 },
]

/**
 * Prices by Store for one item, as its sheet shows it on a phone: the sheet's handle and title around the app's own ItemStorePrices,
 * fed with fixed data.
 */
export function PricesByStoreMock() {
	return (
		<div
			data-testid='landing-prices-by-store'
			className='rounded-t-3xl rounded-b-[18px] bg-card px-4 pt-2 pb-1 ring-1 ring-border'
		>
			<span className='mx-auto mb-3 block h-1 w-10 rounded-full bg-input' />
			<div className='mb-3.5 flex items-center justify-between'>
				<span className='font-display text-lg font-bold tracking-tight'>Prices by Store</span>
				<span className='flex size-8 items-center justify-center text-muted-foreground'>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={1.8}
						className='size-4'
					/>
				</span>
			</div>
			<ItemStorePrices
				itemName='Free-range eggs'
				prices={HISTORY}
				history={HISTORY}
				usualStore={{ ...MARKET_FRESH, source: 'auto', purchase_count: 6 }}
				purchaseCount={10}
				intervalDays={8}
				lastBought='2026-11-18T12:00:00Z'
				testId='landing-prices'
			/>
		</div>
	)
}
