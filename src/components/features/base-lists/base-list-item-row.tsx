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
			size='sm'
			className='hover:bg-primary/1 hover:border-primary/50 transition-colors cursor-pointer group'
		>
			<CardContent className='flex flex-row items-center'>
				<div className='flex flex-1 items-center gap-2 justify-start'>
					<div className='flex-1 space-y-1'>
						<p className='font-bold'>
							{item.name}

							<Badge
								variant='category'
								className='ml-2 text-xs'
							>
								{item.quantity ?? 1} {item.unit}
							</Badge>
						</p>

						<div className='flex gap-2'>
							{item.category && <Badge variant={'category'}>{getCategoryWithEmoji(item.category)}</Badge>}
						</div>

						{item.notes && (
							<div className='flex items-center gap-1'>
								<Separator
									orientation='vertical'
									className='border-primary/20 border'
								/>
								<p className='text-xs md:text-sm text-muted-foreground'>{item.notes}</p>
							</div>
						)}
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
