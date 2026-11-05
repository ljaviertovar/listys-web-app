'use client'

import { useId, useState } from 'react'
import { Message01Icon } from '@hugeicons/core-free-icons'

import { ItemStorePricesSheet } from '@/components/features/base-lists/items/item-store-prices-sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EntityLabel } from '@/components/commons'
import { AveragePrice, ItemNote, ItemQuantityChip } from '@/components/features/list-items'
import { cn, formatCurrency, formatItemName, isUsablePrice } from '@/utils'
import type { ShoppingSessionItem } from '@/types'
import type { ItemStoreSummary } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { formatAlsoAt } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { useSessionItemActions } from './hooks/use-session-item-actions'

export type TripItemStoreInfo = Pick<ItemStoreSummary, 'usual_store' | 'other_stores'> & Partial<Pick<ItemStoreSummary, 'store_prices' | 'store_history'>> & { purchaseStats?: { purchaseCount: number; intervalDays: number | null; lastBought: string | null } }

interface ShoppingSessionItemRowProps {
	item: ShoppingSessionItem
	isCompleted?: boolean
	averagePrice?: number | null
	storeInfo?: TripItemStoreInfo
}

/** Trip rows show what was bought; editing and item menus belong to the reusable list. */
export function ShoppingSessionItemRow({ item, isCompleted = false, averagePrice = null, storeInfo }: ShoppingSessionItemRowProps) {
	const checkboxId = useId()
	const [pricesOpen, setPricesOpen] = useState(false)
	const { checked, toggling, toggle } = useSessionItemActions(item)
	const name = formatItemName(item.name)
	const activeChecked = checked && !isCompleted
	const alsoAt = formatAlsoAt(storeInfo?.other_stores ?? [])
	return (
		<div data-testid={`session-item-${item.id}`} data-checked={checked} className='flex min-h-17 items-start gap-1 px-3 py-3'>
			{!isCompleted ? <span className='-ml-2 flex size-11 shrink-0 items-center justify-center'>
				<Checkbox id={checkboxId} checked={checked} onCheckedChange={toggle} disabled={toggling} aria-label={checked ? `${name}, collected` : `Mark ${name} as collected`} size='lg' />
			</span> : null}
			<div className='grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5'>
				<ItemQuantityChip quantity={item.quantity} unit={item.unit} muted={activeChecked} />
				<label htmlFor={!isCompleted ? checkboxId : undefined} className={cn('min-w-0 truncate text-sm leading-normal font-semibold', !isCompleted && 'cursor-pointer', activeChecked && 'text-slate-400 line-through dark:text-muted-foreground')}>{name}</label>
				{item.notes ? <div className='col-start-2 min-w-0'><ItemNote icon={Message01Icon} testId={`session-item-${item.id}-note`}>{item.notes}</ItemNote></div> : null}
				{storeInfo?.usual_store || alsoAt ? <div className='col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
					{storeInfo?.usual_store ? <EntityLabel name={storeInfo.usual_store.name} testId={`session-item-${item.id}-usual-store`} /> : null}
					{alsoAt ? <span data-testid={`session-item-${item.id}-other-stores`} className='text-xs text-slate-500 dark:text-muted-foreground'>{alsoAt}</span> : null}
				</div> : null}
			</div>
			<div className='shrink-0 pt-0.5 text-right'>
				{isCompleted ? item.price != null ? <span data-testid={`session-item-${item.id}-receipt-price`} className='font-mono text-sm font-semibold tabular-nums'>{formatCurrency(item.price)}</span> : <span className='text-xs text-slate-500'>No price yet</span>
					: isUsablePrice(averagePrice) ? <Button type='button' variant='ghost' size='quiet-touch' aria-label={`Prices by store for ${name}`} onClick={() => setPricesOpen(true)}><AveragePrice price={averagePrice} size='row' muted={activeChecked} testId={`session-item-${item.id}-average-price`} /></Button> : <span className='text-xs text-slate-500'>No price yet</span>}
			</div>
			{!isCompleted ? <ItemStorePricesSheet open={pricesOpen} onOpenChange={setPricesOpen} itemName={name} prices={storeInfo?.store_prices ?? []} history={storeInfo?.store_history} usualStore={storeInfo?.usual_store} {...storeInfo?.purchaseStats} testId={`trip-item-prices-${item.id}`} /> : null}
		</div>
	)
}
