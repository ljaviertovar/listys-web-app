'use client'

import { useState } from 'react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'

import { RowMenu } from '@/components/commons'
import { AveragePrice, ItemEditForm, ItemQuantityChip } from '@/components/features/list-items'
import { formatItemName, isUsablePrice } from '@/utils'
import type { BaseListItem } from '@/types'

import { useBaseListItemActions } from './hooks/use-base-list-item-actions'

interface BaseListItemRowProps {
	item: BaseListItem
	/** A list that is being shopped cannot be changed until the session ends. */
	isLocked?: boolean
}

/**
 * One item of a base list: its quantity chip, name, the average price when the list knows one, its note, and a "⋯" menu.
 * Editing swaps the row for the form in place.
 */
export function BaseListItemRow({ item, isLocked = false }: BaseListItemRowProps) {
	const [editing, setEditing] = useState(false)
	const { save, remove } = useBaseListItemActions(item)
	const name = formatItemName(item.name)

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
			</span>
			<RowMenu
				label={`More options for ${name}`}
				disabled={isLocked}
				testId={`base-list-item-${item.id}-menu`}
				actions={[
					{ label: 'Edit Item', icon: Edit02Icon, onSelect: () => setEditing(true) },
					{ label: 'Delete Item', icon: Delete02Icon, onSelect: remove, tone: 'danger' },
				]}
			/>
		</div>
	)
}
