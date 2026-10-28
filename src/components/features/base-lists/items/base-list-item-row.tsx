'use client'

import { useRef, useState } from 'react'
import { Delete02Icon, Edit02Icon, Store01Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'

import { RowMenu } from '@/components/commons'
import { AveragePrice, ItemEditForm, ItemQuantityChip } from '@/components/features/list-items'
import { StorePickerDialog } from '@/components/features/stores'
import { Badge } from '@/components/ui/badge'
import { formatItemName, isUsablePrice } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { useBaseListItemActions } from './hooks/use-base-list-item-actions'
import { formatAlsoAt } from './helpers/item-store-summary'
import { ItemStorePricesSheet } from './item-store-prices-sheet'

interface BaseListItemRowProps {
	item: BaseListItemWithStoreSummary
	/** A list that is being shopped cannot be changed until the session ends. */
	isLocked?: boolean
	isOwner?: boolean
}

/**
 * One item of a base list: its quantity chip, name, the average price when the list knows one, its note, and a "⋯" menu.
 * Editing swaps the row for the form in place.
 */
export function BaseListItemRow({ item, isLocked = false, isOwner = true }: BaseListItemRowProps) {
	const [editing, setEditing] = useState(false)
	const [storePickerOpen, setStorePickerOpen] = useState(false)
	const [pricesOpen, setPricesOpen] = useState(false)
	const [usualStorePending, setUsualStorePending] = useState(false)
	const usualStorePendingRef = useRef(false)
	const {
		save,
		remove,
		setUsualStore,
	} = useBaseListItemActions(item)
	const name = formatItemName(item.name)
	const alsoAt = formatAlsoAt(item.other_stores ?? [])
	const handleStorePick = async (pick: Parameters<typeof setUsualStore>[0]) => {
		if (usualStorePendingRef.current) return
		usualStorePendingRef.current = true
		setUsualStorePending(true)
		try {
			if (await setUsualStore(pick)) setStorePickerOpen(false)
		} finally {
			usualStorePendingRef.current = false
			setUsualStorePending(false)
		}
	}

	if (editing) {
		return (
			<ItemEditForm
				item={item}
				onSubmit={async values => {
					await save(values)
					setEditing(false)
				}}
				onCancel={() => setEditing(false)}
			/>
		)
	}

	return (
		<div
			data-testid={`base-list-item-${item.id}`}
			className='flex min-h-16 items-center gap-3 py-1.5 pr-1.5 pl-3.5'
		>
			<ItemQuantityChip
				quantity={item.quantity}
				unit={item.unit}
			/>
			<span className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span className='truncate text-sm leading-[1.3] font-semibold'>{name}</span>
				{item.notes || isUsablePrice(item.average_price) ? (
					<span className='flex min-w-0 items-center gap-2'>
						<AveragePrice
							price={item.average_price}
							testId={`base-list-item-${item.id}-average-price`}
						/>
						{item.notes ? <span className='min-w-0 truncate text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>{item.notes}</span> : null}
					</span>
				) : null}
				{item.usual_store ? (
					<Badge
						variant='neutral'
						aria-label={`Usual store: ${item.usual_store.name} (${item.usual_store.source === 'manual' ? 'chosen by you' : 'automatic'})`}
						data-testid={`base-list-item-${item.id}-usual-store`}
					>
						{item.usual_store.name}
					</Badge>
				) : null}
				{alsoAt ? (
					<span
						aria-label={`Other stores: ${(item.other_stores ?? []).map(store => store.name).join(', ')}`}
						data-testid={`base-list-item-${item.id}-other-stores`}
						className='text-xs leading-[1.3] text-muted-foreground'
					>
						{alsoAt}
					</span>
				) : null}
			</span>
			<RowMenu
				label={`More options for ${name}`}
				disabled={isLocked || usualStorePending}
				testId={`base-list-item-${item.id}-menu`}
					actions={[
					{ label: 'Edit Item', icon: Edit02Icon, onSelect: () => setEditing(true) },
						...(isOwner ? [{ label: item.usual_store ? 'Change Usual Store…' : 'Set Usual Store…', icon: Store01Icon, onSelect: () => setStorePickerOpen(true) }] : []),
						...(isOwner && (item.store_prices?.length ?? 0) > 0 ? [{ label: 'Prices by Store', icon: ShoppingBasket01Icon, onSelect: () => setPricesOpen(true) }] : []),
						...(isOwner && item.usual_store?.source === 'manual'
						? [{ label: 'Use Automatic Store', icon: Store01Icon, onSelect: () => setUsualStore(null) }]
						: []),
					{ label: 'Delete Item', icon: Delete02Icon, onSelect: remove, tone: 'danger' },
				]}
			/>
			{isOwner ? <StorePickerDialog
				open={storePickerOpen}
				onOpenChange={setStorePickerOpen}
				title={item.usual_store ? 'Change Usual Store' : 'Set Usual Store'}
				description={item.usual_store?.source === 'manual' ? 'Chosen by you' : 'Automatic, from your purchases'}
				confirmLabel='Set Usual Store'
				onPick={handleStorePick}
				pending={usualStorePending}
				testId={`base-list-item-${item.id}-store-picker`}
			/> : null}
			{isOwner && (item.store_prices?.length ?? 0) > 0 ? <ItemStorePricesSheet
				open={pricesOpen}
				onOpenChange={setPricesOpen}
				itemName={name}
				prices={item.store_prices ?? []}
				testId={`item-store-prices-${item.id}-sheet`}
			/> : null}
		</div>
	)
}
