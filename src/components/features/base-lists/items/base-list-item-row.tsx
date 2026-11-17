'use client'

import { useEffect, useRef } from 'react'
import { Delete02Icon, Edit02Icon, Store03Icon, Tag01Icon } from '@hugeicons/core-free-icons'

import { Item } from '@/components/ui/item'

import { EntityLabel, RowMenu } from '@/components/commons'
import { ItemEditForm, ItemNote, ItemQuantityChip } from '@/components/features/list-items'
import { StorePickerDialog } from '@/components/features/stores'
import { formatItemName } from '@/utils'
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
 * One item of a base list: the quantity and the name on the first line, the note and the store line under them, and a "⋯" menu
 * centred on that first line. A list row shows no price. Editing swaps the row for the form in place.
 */
export function BaseListItemRow({ item, isLocked = false, isOwner = true }: BaseListItemRowProps) {
	const menuTriggerRef = useRef<HTMLButtonElement>(null)
	const shouldReturnFocus = useRef(false)
	const { save, remove, setUsualStore, editing, setEditing, storePickerOpen, setStorePickerOpen,
		pricesOpen, setPricesOpen, usualStorePending, handleStorePick, changeUsualStore } = useBaseListItemRow(item)
	const purchaseStats = getItemPurchaseStats(item)
	const name = formatItemName(item.name)
	const alsoAt = formatAlsoAt(item.other_stores ?? [])
	const pickerInfo = buildUsualStorePickerInfo(item)

	useEffect(() => {
		if (!editing && shouldReturnFocus.current) {
			shouldReturnFocus.current = false
			menuTriggerRef.current?.focus()
		}
	}, [editing])

	if (editing) {
		return (
			<ItemEditForm
				item={item}
				onSubmit={async values => {
					await save(values)
					setEditing(false)
				}}
				onCancel={() => {
					shouldReturnFocus.current = true
					setEditing(false)
				}}
			/>
		)
	}

	return (
		<Item
			size='xs'
			className='min-h-14 items-start'
			data-testid={`base-list-item-${item.id}`}
		>
			<div className='flex min-w-0 flex-1 flex-col'>
				<div className='flex items-start gap-2'>
					<ItemQuantityChip quantity={item.quantity} unit={item.unit} testId={`base-list-item-${item.id}-quantity`} />
					<span className='line-clamp-2 min-w-0 flex-1 text-sm leading-5 font-semibold break-words'>{name}</span>
				</div>
				{item.notes ? <ItemNote className='mt-0.5' testId={`base-list-item-${item.id}-note`}>{item.notes}</ItemNote> : null}
				{item.usual_store || alsoAt ? (
					<span
						aria-label={[
							item.usual_store ? `Usual store: ${item.usual_store.name} (${item.usual_store.source === 'manual' ? 'chosen by you' : 'automatic'})` : null,
							alsoAt ? `Other stores: ${(item.other_stores ?? []).map(store => store.name).join(', ')}` : null,
						].filter(Boolean).join('. ')}
						className='mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5'
					>
						{item.usual_store ? (
							<EntityLabel
								name={item.usual_store.name}
								manual={item.usual_store.source === 'manual'}
								size='row'
								testId={`base-list-item-${item.id}-usual-store`}
							/>
						) : null}
						{alsoAt ? <span aria-label={`Other stores: ${(item.other_stores ?? []).map(store => store.name).join(', ')}`} data-testid={`base-list-item-${item.id}-other-stores`} className='min-w-0 break-words text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>{alsoAt}</span> : null}
					</span>
				) : null}
			</div>
			<RowMenu
				label={`More options for ${name}`}
				className='-mt-3 -mr-1'
				disabled={isLocked || usualStorePending}
				testId={`base-list-item-${item.id}-menu`}
				triggerRef={menuTriggerRef}
					actions={[
					{ label: 'Edit Item', icon: Edit02Icon, onSelect: () => setEditing(true) },
						...(isOwner ? [{ label: item.usual_store ? 'Change Usual Store…' : 'Set Usual Store…', icon: Store03Icon, onSelect: () => setStorePickerOpen(true) }] : []),
						...(isOwner ? [{ label: 'Prices by Store', icon: Tag01Icon, onSelect: () => setPricesOpen(true) }] : []),
						...(isOwner && item.usual_store?.source === 'manual'
						? [{ label: 'Use Automatic Store', icon: Store03Icon, onSelect: () => setUsualStore(null) }]
						: []),
					{ label: 'Delete Item', icon: Delete02Icon, onSelect: remove, tone: 'danger' },
				]}
			/>
			{isOwner ? <StorePickerDialog
				open={storePickerOpen}
				onOpenChange={setStorePickerOpen}
				title='Usual Store'
				itemName={name}
				allowCreate={false}
				currentUsualStore={item.usual_store ? {
					id: item.usual_store.id,
					name: item.usual_store.name,
					source: item.usual_store.source === 'auto' ? 'auto' : 'manual',
					note: pickerInfo.body,
				} : undefined}
				onPickAutomatic={() => handleStorePick(null)}
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
		</Item>
	)
}
