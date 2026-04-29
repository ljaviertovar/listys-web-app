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
	| { context: 'base-list'; baseListId: string; isLocked?: boolean; className?: string; showLabel?: boolean }
	| { context: 'shopping-session'; sessionId: string; className?: string; showLabel?: boolean }

export function AddItemDialogBaseList(props: Props) {
	const [open, setOpen] = useState(false)

	const isBaseList = props.context === 'base-list'
	const isLocked = isBaseList ? props.isLocked : false
	const showLabel = props.showLabel ?? false
	const buttonClassName = props.className ?? ''

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					size='sm'
					className={buttonClassName}
					variant={'outline'}
					disabled={!!isLocked}
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					{showLabel && 'Add item'}
				</Button>
			</DialogTrigger>
			<DialogContent
				className='w-11/12 sm:max-w-125'
				onOpenAutoFocus={e => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className='truncate font-bold tracking-tight text-foreground'>Add New Item</DialogTitle>
					<DialogDescription>
						{isBaseList ? 'Add an item to this base list' : 'Add items you forgot to the shopping list'}
					</DialogDescription>
				</DialogHeader>
				{isBaseList ? (
					<AddItemFormBaseList
						context='base-list'
						baseListId={props.baseListId}
						isLocked={!!isLocked}
					/>
				) : (
					<AddItemFormBaseList
						context='shopping-session'
						sessionId={props.sessionId}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
