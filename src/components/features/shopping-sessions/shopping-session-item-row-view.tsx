'use client'

import { useId } from 'react'

import { Field } from '@/components/ui/field'
import { Item } from '@/components/ui/item'
import { Checkbox } from '@/components/ui/checkbox'
import { EntityLabel } from '@/components/commons'
import { ItemNote, ItemQuantityChip } from '@/components/features/list-items'
import { cn, formatCurrency } from '@/utils'

export interface ShoppingSessionItemRowViewProps {
	/** The row's identity for its test ids (`session-item-<id>`). */
	id: string
	/** The display name, already formatted. */
	name: string
	quantity?: number | null
	unit?: string | null
	notes?: string | null
	/** A finished trip shows the receipt price and no checkbox. */
	isCompleted?: boolean
	checked?: boolean
	/** No handler leaves the checkbox showing its state without acting on it (a static picture of the row). */
	onToggle?: () => void
	toggling?: boolean
	/** The receipt price of a finished trip. */
	price?: number | null
	averagePrice?: number | null
	/** The store under the name: the purchase store of a finished trip, else the usual one. */
	store?: { name: string; manual?: boolean; kind: 'purchase-store' | 'usual-store' } | null
	/** "also at No Frills". */
	alsoAt?: string | null
}

/**
 * The look of a trip row, without its data source: the checkbox, the quantity, the name and the price share the first line; the
 * note and the store line sit under the name and use the full width up to the price. ShoppingSessionItemRow feeds it from the trip.
 */
export function ShoppingSessionItemRowView({
	id,
	name,
	quantity,
	unit,
	notes,
	isCompleted = false,
	checked = false,
	onToggle,
	toggling = false,
	price,
	averagePrice,
	store,
	alsoAt,
}: ShoppingSessionItemRowViewProps) {
	const checkboxId = useId()
	const activeChecked = checked && !isCompleted

	return (
		<Item
			size='xs'
			className='min-h-14'
			data-testid={`session-item-${id}`}
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
							onCheckedChange={onToggle}
							disabled={toggling}
							aria-label={checked ? `${name}, collected` : `Mark ${name} as collected`}
							size='lg'
						/>
					</span>
				) : null}
				<div className='flex min-w-0 flex-1 flex-col'>
					<div className='flex items-start gap-2'>
						<ItemQuantityChip
							quantity={quantity}
							unit={unit}
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
					{notes ? (
						<ItemNote
							className='mt-0.5'
							testId={`session-item-${id}-note`}
						>
							{notes}
						</ItemNote>
					) : null}
					{store || alsoAt ? (
						<div className='mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5'>
							{store ? (
								<EntityLabel
									name={store.name}
									manual={store.manual}
									size='row'
									testId={`session-item-${id}-${store.kind}`}
								/>
							) : null}
							{alsoAt ? (
								<span
									data-testid={`session-item-${id}-other-stores`}
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
						price != null ? (
							<span
								data-testid={`session-item-${id}-receipt-price`}
								className='font-mono text-sm leading-5 font-medium tabular-nums'
							>
								{formatCurrency(price)}
							</span>
						) : (
							<span className='text-xs leading-5 text-muted-foreground'>No price yet</span>
						)
					) : averagePrice != null ? (
						<span
							data-testid={`session-item-${id}-average-price`}
							className='inline-flex items-baseline gap-1 whitespace-nowrap'
						>
							<span className='font-mono text-sm leading-5 font-medium tabular-nums'>{formatCurrency(averagePrice)}</span>
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
