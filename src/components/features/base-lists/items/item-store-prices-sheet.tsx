'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon, Edit02Icon, Pin02Icon } from '@hugeicons/core-free-icons'

import { EntityLabel, SheetDialog, StatTile } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import { formatCurrency, formatTripDate } from '@/utils'

import type { ItemStoreSummary, StoreHistoryEntry, StorePriceEntry } from './helpers/item-store-summary'
import { compareStorePrices } from './helpers/compare-store-prices'

const shortDate = (value: string) => formatTripDate(new Date(value)).replace(/^\S+\s/, '')

export function ItemStorePricesSheet({ open, onOpenChange, itemName, prices, history, testId, usualStore = null, purchaseCount = 0, intervalDays = null, lastBought = null, onChangeUsualStore }: {
	open: boolean
	onOpenChange: (open: boolean) => void
	itemName: string
	prices: StorePriceEntry[]
	history?: StoreHistoryEntry[]
	testId: string
	usualStore?: ItemStoreSummary['usual_store']
	purchaseCount?: number
	intervalDays?: number | null
	lastBought?: string | null
	onChangeUsualStore?: () => void
}) {
	const rows: StoreHistoryEntry[] = history ?? prices.map(entry => ({ ...entry, purchase_count: entry.purchase_count ?? 0 }))
	const priced = rows.filter((entry): entry is StoreHistoryEntry & { last_price: number } => entry.last_price !== null)
	const comparison = compareStorePrices(priced)
	return <SheetDialog open={open} onOpenChange={onOpenChange} title='Prices by Store' description={itemName} testId={testId}>
		<div className='mt-3 flex flex-col gap-4' data-testid={`${testId}-content`}>
			{usualStore ? <div className='flex flex-col gap-1'><EntityLabel name={usualStore.name} testId={`${testId}-usual-store`} /><p className='text-xs text-slate-500'>Usual store · {usualStore.source === 'manual' ? 'set by you' : 'automatic'}</p></div>
				: rows.length === 0 ? <div><Badge variant='tag'><HugeiconsIcon icon={Edit02Icon} aria-hidden='true' strokeWidth={1.8} />Added by hand</Badge></div> : null}
			<div className='grid grid-cols-3 gap-2'>
				<StatTile testId={`${testId}-times-bought`} value={purchaseCount} label='Times bought' />
				<StatTile testId={`${testId}-between-trips`} value={intervalDays == null ? '—' : `~${Math.round(intervalDays)}d`} label='Between trips' />
				<StatTile testId={`${testId}-last-bought`} value={lastBought ? shortDate(lastBought) : '—'} label='Last bought' />
			</div>
			<div className='flex flex-col gap-1'><h3 className='text-sm font-semibold'>Last price by store</h3><p className='text-xs text-slate-500'>Only prices from your own receipts.</p></div>
			{comparison.notComparable ? <p className='text-xs text-muted-foreground'>Some prices use different units and can’t be compared.</p> : null}
			{rows.length ? <div className='flex max-h-[min(60vh,480px)] flex-col gap-2 overflow-y-auto'>
				{rows.map(entry => {
					const quantity = entry.last_quantity
					const unit = entry.last_unit?.trim() || 'each'
					const hasContext = quantity !== null && quantity > 0 && (quantity !== 1 || unit.toLowerCase() !== 'each')
					return <Card key={entry.store.id} variant='stat' size='stat' tone='muted' data-testid={`${testId}-store-${entry.store.id}`}>
						<div className='flex min-w-0 items-start justify-between gap-3'>
							<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
								<EntityLabel name={entry.store.name} testId={`${testId}-entity-${entry.store.id}`} />
								<p className='text-xs text-slate-500'>{entry.last_price_at ? shortDate(entry.last_price_at) : 'No price yet'} · {entry.purchase_count} {entry.purchase_count === 1 ? 'time' : 'times'}</p>
								<div className='flex flex-wrap gap-1.5'>
									{entry.store.id === comparison.cheapestStoreId ? <Badge variant='tag'><HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.8} aria-hidden='true' />Cheapest</Badge> : null}
									{entry.store.id === usualStore?.id ? <Badge variant='tag'><HugeiconsIcon icon={Pin02Icon} strokeWidth={1.8} aria-hidden='true' />Usual</Badge> : null}
								</div>
								{hasContext ? <p className='text-xs text-slate-500'>{quantity} {unit}</p> : null}
							</div>
							<div className='shrink-0 text-right'><p className='font-mono text-sm font-semibold tabular-nums'>{entry.last_price == null ? '—' : formatCurrency(entry.last_price)}</p>
								{hasContext && quantity && entry.last_price != null ? <p className='text-xs text-slate-500'>{formatCurrency(entry.last_price / quantity)} / {unit}</p> : null}
							</div>
						</div>
					</Card>
				})}
			</div> : <Card size='saved' tone='muted' variant='stat'><div data-testid={`${testId}-empty`} className='flex flex-col gap-3 text-center'><h3 className='text-base font-semibold'>No prices yet</h3><p className='text-sm text-slate-500'>Prices come from your receipts. Upload one after a trip to see what you paid at each store.</p><UploadTicketDialog label='Upload a Receipt' /></div></Card>}
			{rows.length === 1 ? <p className='text-xs leading-normal text-slate-500'>Bought at one store so far. Prices from other stores show here once you buy it there.</p> : null}
			{onChangeUsualStore ? <Button type='button' variant='outline' size='primary' onClick={onChangeUsualStore}>Change Usual Store</Button> : null}
		</div>
	</SheetDialog>
}
