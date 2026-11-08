'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { SheetDialog } from '@/components/commons'

import { AddItemForm, type AddItemTarget } from './add-item-form'

/** The trigger is a regular `Button`: `variant='default'` is the one that fills an empty list, the default (`secondary`) is the toolbar one. */
interface AddItemSheetProps extends Omit<ButtonProps, 'children'> {
	target: AddItemTarget
	isLocked?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Omits the default button when another control, such as a menu item, opens the sheet. */
	trigger?: null
}

/** "Add Item": the button and the sheet with the form that adds an item to a base list or to a shopping session. */
export function AddItemSheet({ target, isLocked = false, open: controlledOpen, onOpenChange, trigger, ...buttonProps }: AddItemSheetProps) {
	const [ownOpen, setOwnOpen] = useState(false)
	const open = controlledOpen ?? ownOpen
	const setOpen = onOpenChange ?? setOwnOpen

	return (
		<SheetDialog
			open={open}
			onOpenChange={setOpen}
			trigger={trigger === null ? undefined : (
				<Button
					variant='outline'
					size='primary'
					{...buttonProps}
					disabled={isLocked}
					data-testid={`add-item-button-${target.context}`}
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					Add Item
				</Button>
			)}
			title='Add New Item'
			description={
				target.context === 'base-list'
					? 'Add an item to this base list.'
					: 'Add an item you forgot to this shopping list.'
			}
			testId='add-item-sheet'
		>
			<AddItemForm
				target={target}
				isLocked={isLocked}
				onCancel={() => setOpen(false)}
			/>
		</SheetDialog>
	)
}
