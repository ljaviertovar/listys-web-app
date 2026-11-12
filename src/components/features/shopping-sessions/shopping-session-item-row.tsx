'use client'

import { useId } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { EntityLabel } from '@/components/commons'
import { ItemNote, ItemQuantityChip } from '@/components/features/list-items'
import { cn, formatCurrency, formatItemName } from '@/utils'
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
	purchaseStore?: { id: string; name: string } | null
}

/** Trip rows show what was bought; editing and item menus belong to the reusable list. */
export function ShoppingSessionItemRow({ item, isCompleted = false, averagePrice, storeInfo, purchaseStore }: ShoppingSessionItemRowProps) {
	const checkboxId = useId()
	const { checked, toggling, toggle } = useSessionItemActions(item)
	const name = formatItemName(item.name)
	const activeChecked = checked && !isCompleted
	const primaryStore = purchaseStore ?? storeInfo?.usual_store ?? null
	const alsoAt = formatAlsoAt((storeInfo?.other_stores ?? []).filter(store => store.id !== purchaseStore?.id))
	return (
		<div data-testid={`session-item-${item.id}`} data-checked={checked} className='flex min-h-17 items-center gap-1 px-3 py-3'>
			{!isCompleted ? <span className='-ml-2 flex size-11 shrink-0 items-center justify-center'>
				<Checkbox id={checkboxId} checked={checked} onCheckedChange={toggle} disabled={toggling} aria-label={checked ? `${name}, collected` : `Mark ${name} as collected`} size='lg' />
			</span> : null}
			<div className='grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5'>
				<ItemQuantityChip quantity={item.quantity} unit={item.unit} muted={activeChecked} />
				<label htmlFor={!isCompleted ? checkboxId : undefined} className={cn('min-w-0 truncate text-sm leading-normal font-semibold', !isCompleted && 'cursor-pointer', activeChecked && 'text-slate-400 line-through dark:text-muted-foreground')}>{name}</label>
				{item.notes ? <div className='col-span-2 min-w-0'><ItemNote testId={`session-item-${item.id}-note`}>{item.notes}</ItemNote></div> : null}
				{primaryStore || alsoAt ? <div className='col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
					{primaryStore ? <EntityLabel name={primaryStore.name} manual={!purchaseStore && storeInfo?.usual_store?.source === 'manual'} testId={`session-item-${item.id}-${purchaseStore ? 'purchase-store' : 'usual-store'}`} /> : null}
					{alsoAt ? <span data-testid={`session-item-${item.id}-other-stores`} className='text-xs text-muted-foreground dark:text-muted-foreground'>{alsoAt}</span> : null}
				</div> : null}
			</div>
			<div className={cn('shrink-0 pt-1 text-right', activeChecked && 'opacity-60')}>
				{isCompleted ? (
					item.price != null
						? <span data-testid={`session-item-${item.id}-receipt-price`} className='font-mono text-sm font-semibold tabular-nums'>{formatCurrency(item.price)}</span>
						: <span className='text-xs text-muted-foreground'>No price yet</span>
				) : averagePrice != null ? (
					<span data-testid={`session-item-${item.id}-average-price`} className='inline-flex items-baseline gap-1 whitespace-nowrap'>
						<span className='font-mono text-sm font-semibold tabular-nums'>{formatCurrency(averagePrice)}</span>
						<span className='text-xs font-medium text-muted-foreground'>avg</span>
					</span>
				) : <span className='whitespace-nowrap text-xs text-muted-foreground'>No price yet</span>}
			</div>
		</div>
	)
}
