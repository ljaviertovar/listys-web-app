'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { AddItemForm } from './add-item-form'

interface Props {
	runId: string
}

export function AddItemDialog({ runId }: Props) {
	const [open, setOpen] = useState(false)

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					size='lg'
					className='w-full'
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					Add items you forgot to the shopping list
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<DialogDescription>Add items you forgot to the shopping list</DialogDescription>
				</DialogHeader>
				<AddItemForm
					runId={runId}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
