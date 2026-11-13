'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Attachment01Icon, Calendar01Icon, Clock01Icon, InformationCircleIcon, RepeatIcon, ShoppingCart02Icon, Tag01Icon } from '@hugeicons/core-free-icons'

import { EntityLabel, RowIcon, SheetDialog, StatTile } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
		<div className='mt-3 flex flex-col gap-4 pb-3' data-testid={`${testId}-content`}>
			{usualStore && rows.length ? <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
				<EntityLabel name={usualStore.name} manual={usualStore.source === 'manual'} testId={`${testId}-usual-store`} />
				<Badge variant='tag'><HugeiconsIcon icon={RepeatIcon} strokeWidth={1.8} aria-hidden='true' />Usual</Badge>
			</div>
				: null}
			{rows.length ? <div className='grid grid-cols-3 gap-2'>
				<StatTile testId={`${testId}-times-bought`} value={purchaseCount} label='Times bought' variant='white' icon={ShoppingCart02Icon} iconTone='primary' />
				<StatTile testId={`${testId}-between-trips`} value={intervalDays == null ? '—' : `~${Math.round(intervalDays)}`} unit={intervalDays == null ? undefined : 'd'} label='Between trips' variant='white' icon={Clock01Icon} iconTone='accent' />
				<StatTile testId={`${testId}-last-bought`} value={lastBought ? shortDate(lastBought).split(' ')[0] : '—'} unit={lastBought ? shortDate(lastBought).split(' ')[1] : undefined} label='Last bought' variant='white' icon={Calendar01Icon} iconTone='success' />
			</div> : null}
			{rows.length ? <div className='flex flex-col gap-1'><h3 className='text-xs leading-tight font-semibold tracking-wide text-text-secondary uppercase'>Last price by store</h3><p className='text-xs leading-[1.4] text-muted-foreground'>Only prices from your own receipts.</p></div> : null}
			{comparison.notComparable ? <p className='text-xs text-muted-foreground'>Some prices use different units and can’t be compared.</p> : null}
			{rows.length ? <div className='flex max-h-[min(60vh,480px)] flex-col divide-y divide-slate-200 overflow-y-auto rounded-2xl bg-muted px-3 dark:divide-border'>
				{rows.map(entry => {
					const quantity = entry.last_quantity
					const unit = entry.last_unit?.trim() || 'each'
					const hasContext = quantity !== null && quantity > 0 && (quantity !== 1 || unit.toLowerCase() !== 'each')
					return <div key={entry.store.id} data-testid={`${testId}-store-${entry.store.id}`} className='flex min-h-15 items-center gap-2 py-1.5'>
						<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
							<span className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
								<EntityLabel name={entry.store.name} manual={usualStore?.id === entry.store.id && usualStore.source === 'manual'} testId={`${testId}-entity-${entry.store.id}`} />
								{entry.store.id === comparison.cheapestStoreId ? <Badge variant='tag'><HugeiconsIcon icon={Tag01Icon} strokeWidth={1.8} aria-hidden='true' />Cheapest</Badge> : null}
								{entry.store.id === usualStore?.id ? <Badge variant='tag'><HugeiconsIcon icon={RepeatIcon} strokeWidth={1.8} aria-hidden='true' />Usual</Badge> : null}
							</span>
							<p className='text-xs leading-[1.4] text-body'>{entry.last_price_at ? `Last ${shortDate(entry.last_price_at)}` : 'No price yet'} · <b className='font-mono font-semibold text-foreground'>{entry.purchase_count}</b> {entry.purchase_count === 1 ? 'time' : 'times'}</p>
							{hasContext ? <p className='text-xs text-muted-foreground'>{quantity} {unit}</p> : null}
						</div>
						<div className='flex shrink-0 flex-col items-end gap-1 text-right'><p className='font-mono text-sm font-semibold tabular-nums'>{entry.last_price == null ? '—' : formatCurrency(entry.last_price)}</p>
							{hasContext && quantity && entry.last_price != null ? <p className='text-xs text-muted-foreground'>{formatCurrency(entry.last_price / quantity)} / {unit}</p> : null}
						</div>
					</div>
				})}
			</div> : <Alert variant='receipt-info' data-testid={`${testId}-empty`}>
				<RowIcon icon={InformationCircleIcon} tone='primary' size='alert' testId={`${testId}-empty-icon`} />
				<AlertTitle>No prices yet</AlertTitle>
				<AlertDescription>Prices come from your receipts. Upload one with this item to see what it costs and where.</AlertDescription>
			</Alert>}
			{rows.length === 0 ? <UploadTicketDialog label='Attach Receipt' triggerIcon={Attachment01Icon} variant='default' size='primary' className='w-full' /> : null}
			{rows.length === 1 ? <Alert variant='receipt-info' role='note' data-testid={`${testId}-compare-prices-guidance`}>
				<RowIcon icon={InformationCircleIcon} tone='primary' size='alert' testId={`${testId}-compare-prices-guidance-icon`} />
				<AlertDescription>Buy it at another store and attach that receipt to compare prices.</AlertDescription>
			</Alert> : null}
			{rows.length && onChangeUsualStore ? <Button type='button' variant='secondary' size='primary' onClick={onChangeUsualStore}>Change Usual Store</Button> : null}
		</div>
	</SheetDialog>
}
