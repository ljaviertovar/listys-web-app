'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { AddItemFormBaseList } from './add-item-form-base-list'

type Props =
	| { context: 'base-list'; baseListId: string; isLocked?: boolean }
	| { context: 'shopping-run'; runId: string }

export function AddItemDialogBaseList(props: Props) {
	const [open, setOpen] = useState(false)

	const isBaseList = props.context === 'base-list'
	const isLocked = isBaseList ? props.isLocked : false

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					className='w-full'
					size='sm'
					disabled={!!isLocked}
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					Add Item
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-125'>
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<DialogDescription>
						{isBaseList ? 'Add an item to this base list' : 'Add items you forgot to the shopping list'}
					</DialogDescription>
				</DialogHeader>
				{isBaseList ? (
					<AddItemFormBaseList
						context='base-list'
						baseListId={props.baseListId}
						isLocked={!!isLocked}
						onSuccess={() => setOpen(false)}
					/>
				) : (
					<AddItemFormBaseList
						context='shopping-run'
						runId={props.runId}
						onSuccess={() => setOpen(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
