'use client'

import { Delete02Icon, Edit02Icon, Pin02Icon, Store01Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { RowMenu } from '@/components/commons'
import { AveragePrice, ItemEditForm, ItemNote, ItemQuantityChip, ItemTrailing } from '@/components/features/list-items'
import { StorePickerDialog } from '@/components/features/stores'
import { Badge } from '@/components/ui/badge'
import { formatItemName, isUsablePrice } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { useBaseListItemRow } from './hooks/use-base-list-item-row'
import { getItemPurchaseStats } from './helpers/item-purchase-stats'
import { formatAlsoAt } from './helpers/item-store-summary'
import { buildUsualStorePickerInfo } from './helpers/usual-store-picker-info'
import { ItemStorePricesSheet } from './item-store-prices-sheet'

interface BaseListItemRowProps {
	item: BaseListItemWithStoreSummary
	/** A list that is being shopped cannot be changed until the session ends. */
	isLocked?: boolean
	isOwner?: boolean
}

/**
 * One item of a base list: its name with the note under it, the average price with the quantity under that, and a "⋯" menu.
 * Editing swaps the row for the form in place.
 */
export function BaseListItemRow({ item, isLocked = false, isOwner = true }: BaseListItemRowProps) {
	const { save, remove, setUsualStore, editing, setEditing, storePickerOpen, setStorePickerOpen,
		pricesOpen, setPricesOpen, usualStorePending, handleStorePick, changeUsualStore } = useBaseListItemRow(item)
	const purchaseStats = getItemPurchaseStats(item)
	const name = formatItemName(item.name)
	const alsoAt = formatAlsoAt(item.other_stores ?? [])
	const pickerInfo = buildUsualStorePickerInfo(item)

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
			className='flex min-h-17 items-center gap-0.5 py-1 pr-1.5 pl-3.5'
		>
			<span className='flex min-w-0 flex-1 flex-col gap-1.5'>
				<span className='truncate text-sm leading-[1.3] font-semibold'>{name}</span>
				{item.notes ? <ItemNote>{item.notes}</ItemNote> : null}
				{item.usual_store ? (
					<Badge
						variant={item.usual_store.source === 'manual' ? 'store-manual' : 'store'}
						aria-label={`Usual store: ${item.usual_store.name} (${item.usual_store.source === 'manual' ? 'chosen by you' : 'automatic'})`}
						data-testid={`base-list-item-${item.id}-usual-store`}
					>
						<HugeiconsIcon
							icon={item.usual_store.source === 'manual' ? Pin02Icon : Store01Icon}
							strokeWidth={1.8}
							aria-hidden='true'
						/>
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
			<ItemTrailing>
				{isUsablePrice(item.average_price) ? (
					<AveragePrice
						price={item.average_price}
						testId={`base-list-item-${item.id}-average-price`}
					/>
				) : null}
				<ItemQuantityChip
					quantity={item.quantity}
					unit={item.unit}
				/>
			</ItemTrailing>
			<RowMenu
				label={`More options for ${name}`}
				disabled={isLocked || usualStorePending}
				testId={`base-list-item-${item.id}-menu`}
					actions={[
					{ label: 'Edit Item', icon: Edit02Icon, onSelect: () => setEditing(true) },
						...(isOwner ? [{ label: item.usual_store ? 'Change Usual Store…' : 'Set Usual Store…', icon: Store01Icon, onSelect: () => setStorePickerOpen(true) }] : []),
						...(isOwner ? [{ label: 'Prices by Store', icon: ShoppingBasket01Icon, onSelect: () => setPricesOpen(true) }] : []),
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
				description={name}
				context={{ headline: pickerInfo.headline, body: pickerInfo.body }}
				storeDetails={pickerInfo.details}
				footnote='A store you pick stays until you change it. Receipts won’t move it.'
				confirmLabel='Set Usual Store'
				onPick={handleStorePick}
				pending={usualStorePending}
				testId={`base-list-item-${item.id}-store-picker`}
			/> : null}
			{isOwner ? <ItemStorePricesSheet
				open={pricesOpen}
				onOpenChange={setPricesOpen}
				itemName={name}
				prices={item.store_prices ?? []}
				history={item.store_history}
				usualStore={item.usual_store ? { ...item.usual_store, purchase_count: item.usual_store.purchase_count ?? 0 } : null}
				{...purchaseStats}
				onChangeUsualStore={changeUsualStore}
				testId={`item-store-prices-${item.id}-sheet`}
			/> : null}
		</div>
	)
}
