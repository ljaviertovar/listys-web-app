'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ActionsItemFormBaseList } from '@/components/app/actions-item-form-base-list'

import { deleteBaseListItem, updateBaseListItem } from '@/actions/base-lists'

import type { BaseListItem } from '@/features/base-lists/types'
import { Separator } from '@/components/ui/separator'
import { getCategoryWithEmoji } from '@/data/constants'

interface Props {
	item: BaseListItem
	isLocked?: boolean
}

export function BaseListItemRow({ item, isLocked = false }: Props) {
	const [editing, setEditing] = useState(false)

	const handleUpdate = async (id: string, data: { name?: string; quantity?: number; notes?: string }) => {
		return await updateBaseListItem(id, data)
	}

	const handleDelete = async (id: string) => {
		return await deleteBaseListItem(id)
	}

	if (editing) {
		return (
			<ActionsItemFormBaseList
				item={item}
				isDisabled={isLocked}
				maxNameLength={100}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				successMessages={{
					update: 'Item updated',
					delete: 'Item deleted',
				}}
				isEditing={editing}
				onEditingChange={setEditing}
			/>
		)
	}

	return (
		<Card
			variant='premium'
			size='compact'
			className='hover:bg-primary/1 hover:border-primary/50 transition-all cursor-pointer group'
		>
			<CardContent className='flex flex-row items-center p-2.5 md:p-4'>
				<div className='flex flex-1 min-w-0 items-center justify-start gap-3'>
					<Badge
						variant={'secondary'}
						className={`h-7 min-w-12 justify-center rounded-lg px-2 py-0 font-bold text-sm uppercase transition-all bg-accent text-accent-foreground`}
					>
						{item.quantity ?? 1}
						<span className='ml-0.5 text-xs font-medium lowercase opacity-60'>{item.unit || 'u'}</span>
					</Badge>

					<div className='flex-1 min-w-0'>
						<p
							className={`truncate text-sm font-semibold tracking-tight md:text-base text-foreground'
							`}
						>
							{item.name}
						</p>

						{item.notes && <p className='mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground'>{item.notes}</p>}
					</div>
				</div>
				<ActionsItemFormBaseList
					item={item}
					isDisabled={isLocked}
					maxNameLength={100}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
					successMessages={{
						update: 'Item updated',
						delete: 'Item deleted',
					}}
					isEditing={editing}
					onEditingChange={setEditing}
				/>
			</CardContent>
		</Card>
	)
}
