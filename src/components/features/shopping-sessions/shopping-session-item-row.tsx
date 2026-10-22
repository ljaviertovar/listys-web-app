'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'

import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmSheet, RowMenu } from '@/components/commons'
import { ItemEditForm, ItemQuantityChip } from '@/components/features/list-items'
import { cn, formatItemName } from '@/utils'
import type { ShoppingSessionItem } from '@/types'

import { useSessionItemActions } from './hooks/use-session-item-actions'

interface ShoppingSessionItemRowProps {
	item: ShoppingSessionItem
	/** A finished session is only read: nothing is ticked, edited or deleted. */
	isCompleted?: boolean
}

/**
 * One item of a shopping session: a 44px checkbox target, its name (struck through once it is in the cart), its quantity
 * chip and note, and a "⋯" menu. Editing swaps the row for the form in place.
 */
export function ShoppingSessionItemRow({ item, isCompleted = false }: ShoppingSessionItemRowProps) {
	const checkboxId = useId()
	const rowRef = useRef<HTMLDivElement>(null)
	const returnFocusToMenu = useRef(false)
	const [editing, setEditing] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const { checked, toggling, toggle, save, remove } = useSessionItemActions(item)
	const name = formatItemName(item.name)

	useEffect(() => {
		if (!editing && returnFocusToMenu.current) {
			returnFocusToMenu.current = false
			rowRef.current?.querySelector<HTMLButtonElement>('[data-testid$="-menu"]')?.focus()
		}
	}, [editing])

	const closeEditor = () => {
		returnFocusToMenu.current = true
		setEditing(false)
	}

	if (editing) {
		return (
			<ItemEditForm
				item={item}
				onSubmit={async values => {
					await save(values)
					closeEditor()
				}}
				onCancel={closeEditor}
			/>
		)
	}

	return (
		<div
			ref={rowRef}
			data-testid={`session-item-${item.id}`}
			data-checked={checked}
			className='flex min-h-17 items-center gap-0.5 py-1 pr-1.5 pl-0.5'
		>
			<label
				htmlFor={isCompleted ? undefined : checkboxId}
				className={cn('flex min-w-0 flex-1 items-center gap-0.5', !isCompleted && 'cursor-pointer')}
			>
				{isCompleted ? (
					<span className='w-3.5 shrink-0' />
				) : (
					<span className='flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							id={checkboxId}
							checked={checked}
							onCheckedChange={toggle}
							disabled={toggling}
							aria-label={checked ? `${name}, collected` : `Mark ${name} as collected`}
							size='lg'
						/>
					</span>
				)}
				<span className='flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-0.5'>
					<span
						className={cn(
							'w-full break-words text-sm leading-[1.3] font-semibold',
							checked && 'text-slate-600 line-through dark:text-muted-foreground',
						)}
					>
						{name}
					</span>
					<span className='flex w-full min-w-0 items-center gap-2'>
						<ItemQuantityChip
							quantity={item.quantity}
							unit={item.unit}
							muted={checked}
						/>
						{item.notes ? (
							<span className='min-w-0 break-words text-xs leading-[1.3] text-slate-600 dark:text-muted-foreground'>{item.notes}</span>
						) : null}
					</span>
				</span>
			</label>
			{isCompleted ? null : (
				<RowMenu
					label={`More options for ${name}`}
					testId={`session-item-${item.id}-menu`}
					actions={[
						{ label: 'Edit Item', icon: Edit02Icon, onSelect: () => setEditing(true) },
						{ label: 'Delete Item', icon: Delete02Icon, onSelect: () => setDeleteOpen(true), tone: 'danger' },
					]}
				/>
			)}
			<ConfirmSheet
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title='Delete Item?'
				consequence={`This removes ${name} from this shopping session. This action can’t be undone.`}
				cancelLabel='Keep Item'
				confirmLabel='Delete Item'
				loadingLabel='Deleting Item…'
				tone='danger'
				loading={deleting}
				onConfirm={async () => {
					setDeleting(true)
					try {
						if (await remove()) setDeleteOpen(false)
					} finally {
						setDeleting(false)
					}
				}}
				testId={`delete-session-item-${item.id}-sheet`}
			/>
		</div>
	)
}
