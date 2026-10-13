'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { A1_SECONDARY, A1_TOOLBAR_BUTTON } from '@/components/app/helpers/a1-surface'
import { SheetDialog } from '@/components/commons'
import { cn } from '@/utils'

import { AddItemForm, type AddItemTarget } from './add-item-form'

interface AddItemSheetProps {
	target: AddItemTarget
	isLocked?: boolean
	/** `secondary` is the toolbar button; `primary` the one that fills an empty list. */
	emphasis?: 'secondary' | 'primary'
	className?: string
}

/** "Add Item": the button and the sheet with the form that adds an item to a base list or to a shopping session. */
export function AddItemSheet({ target, isLocked = false, emphasis = 'secondary', className }: AddItemSheetProps) {
	const [open, setOpen] = useState(false)

	return (
		<SheetDialog
			open={open}
			onOpenChange={setOpen}
			trigger={
				<Button
					variant={emphasis === 'primary' ? 'default' : 'outline'}
					disabled={isLocked}
					data-testid={`add-item-button-${target.context}`}
					className={cn(
						A1_TOOLBAR_BUTTON,
						emphasis === 'primary' ? 'h-12 px-6 text-[15px]' : A1_SECONDARY,
						className,
					)}
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-[18px]'
					/>
					Add Item
				</Button>
			}
			title='Add New Item'
			description={target.context === 'base-list' ? 'Add an item to this base list.' : 'Add an item you forgot to this shopping list.'}
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
