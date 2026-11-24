'use client'

import { useId } from 'react'

import { Field } from '@/components/ui/field'
import { Item } from '@/components/ui/item'

import { Checkbox } from '@/components/ui/checkbox'
import { EntityLabel } from '@/components/commons'
import { ItemNote, ItemQuantityChip } from '@/components/features/list-items'
import { cn, formatCurrency, formatItemName } from '@/utils'
import type { ShoppingSessionItem } from '@/types'
import type { ItemStoreSummary } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { formatAlsoAt } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { useSessionItemActions } from './hooks/use-session-item-actions'

export type TripItemStoreInfo = Pick<ItemStoreSummary, 'usual_store' | 'other_stores'> &
	Partial<Pick<ItemStoreSummary, 'store_prices' | 'store_history'>> & {
		purchaseStats?: { purchaseCount: number; intervalDays: number | null; lastBought: string | null }
	}

interface ShoppingSessionItemRowProps {
	item: ShoppingSessionItem
	isCompleted?: boolean
	averagePrice?: number | null
	storeInfo?: TripItemStoreInfo
	purchaseStore?: { id: string; name: string } | null
}

/**
 * Trip rows show what was bought; editing and item menus belong to the reusable list. The checkbox, the quantity, the name and the
 * price share the first line; the note and the store line sit under the name and use the full width up to the price.
 */
export function ShoppingSessionItemRow({
	item,
	isCompleted = false,
	averagePrice,
	storeInfo,
	purchaseStore,
}: ShoppingSessionItemRowProps) {
	const checkboxId = useId()
	const { checked, toggling, toggle } = useSessionItemActions(item)
	const name = formatItemName(item.name)
	const activeChecked = checked && !isCompleted
	const primaryStore = purchaseStore ?? storeInfo?.usual_store ?? null
	const alsoAt = formatAlsoAt((storeInfo?.other_stores ?? []).filter(store => store.id !== purchaseStore?.id))
	return (
		<Item
			size='xs'
			className='min-h-14'
			data-testid={`session-item-${item.id}`}
			data-checked={checked}
		>
			<Field
				orientation='horizontal'
				spacing='tight'
				className='items-start'
			>
				{!isCompleted ? (
					<span className='-mt-3 -ml-2 flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							id={checkboxId}
							checked={checked}
							onCheckedChange={toggle}
							disabled={toggling}
							aria-label={checked ? `${name}, collected` : `Mark ${name} as collected`}
							size='lg'
						/>
					</span>
				) : null}
				<div className='flex min-w-0 flex-1 flex-col'>
					<div className='flex items-start gap-2'>
						<ItemQuantityChip
							quantity={item.quantity}
							unit={item.unit}
							muted={activeChecked}
						/>
						<label
							htmlFor={!isCompleted ? checkboxId : undefined}
							className={cn(
								'line-clamp-2 min-w-0 flex-1 text-sm leading-5 font-semibold break-words',
								!isCompleted && 'cursor-pointer',
								activeChecked && 'text-muted-foreground line-through dark:text-muted-foreground',
							)}
						>
							{name}
						</label>
					</div>
					{item.notes ? (
						<ItemNote
							className='mt-0.5'
							testId={`session-item-${item.id}-note`}
						>
							{item.notes}
						</ItemNote>
					) : null}
					{primaryStore || alsoAt ? (
						<div className='mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5'>
							{primaryStore ? (
								<EntityLabel
									name={primaryStore.name}
									manual={!purchaseStore && storeInfo?.usual_store?.source === 'manual'}
									size='row'
									testId={`session-item-${item.id}-${purchaseStore ? 'purchase-store' : 'usual-store'}`}
								/>
							) : null}
							{alsoAt ? (
								<span
									data-testid={`session-item-${item.id}-other-stores`}
									className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'
								>
									{alsoAt}
								</span>
							) : null}
						</div>
					) : null}
				</div>
				<div className={cn('shrink-0 text-right', activeChecked && 'opacity-70')}>
					{isCompleted ? (
						item.price != null ? (
							<span
								data-testid={`session-item-${item.id}-receipt-price`}
								className='font-mono text-sm leading-5 font-medium tabular-nums'
							>
								{formatCurrency(item.price)}
							</span>
						) : (
							<span className='text-xs leading-5 text-muted-foreground'>No price yet</span>
						)
					) : averagePrice != null ? (
						<span
							data-testid={`session-item-${item.id}-average-price`}
							className='inline-flex items-baseline gap-1 whitespace-nowrap'
						>
							<span className='font-mono text-sm leading-5 font-medium tabular-nums'>
								{formatCurrency(averagePrice)}
							</span>
							<span className='text-xs font-medium text-muted-foreground'>avg</span>
						</span>
					) : (
						<span className='whitespace-nowrap text-xs leading-5 text-muted-foreground'>No price yet</span>
					)}
				</div>
			</Field>
		</Item>
	)
}
