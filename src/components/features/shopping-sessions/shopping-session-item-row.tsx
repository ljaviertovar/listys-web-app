'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
	toggleShoppingSessionItem,
	updateShoppingSessionItem,
	deleteShoppingSessionItem,
} from '@/lib/api/endpoints/shopping-sessions'
import type { ShoppingSessionItem } from '@/features/shopping-sessions/types'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ActionsItemFormBaseList } from '@/components/app/actions-item-form-base-list'
import { Separator } from '@/components/ui/separator'
import { getCategoryWithEmoji } from '@/data/constants'

interface Props {
	item: ShoppingSessionItem
	isCompleted?: boolean
}

export function ShoppingSessionItemRow({ item, isCompleted = false }: Props) {
	const [checked, setChecked] = useState(item.checked)
	const [loading, setLoading] = useState(false)
	const [editing, setEditing] = useState(false)
	const router = useRouter()

	const handleToggle = async () => {
		if (isCompleted) return // Don't allow toggling completed sessions

		const newChecked = !checked
		setChecked(newChecked) // Optimistic update
		setLoading(true)

		try {
			const { error } = await toggleShoppingSessionItem(item.id, newChecked)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			setChecked(!newChecked) // Revert on error
			console.error('Failed to toggle item:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdate = async (id: string, data: { name?: string; quantity?: number; notes?: string }) => {
		return await updateShoppingSessionItem(id, data)
	}

	const handleDelete = async (id: string) => {
		return await deleteShoppingSessionItem(id)
	}

	const handleCardClick = () => {
		if (loading || isCompleted || editing) return
		handleToggle()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (loading || isCompleted || editing) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			handleToggle()
		}
	}

	if (editing) {
		return (
			<ActionsItemFormBaseList
				item={item}
				isDisabled={isCompleted}
				maxNameLength={200}
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
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			className={`transition-all cursor-pointer ${checked ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
		>
			<CardContent className='flex flex-row items-center'>
				<div className='flex flex-1 items-center gap-2 justify-start'>
					<div className='flex-1 space-y-1'>
						<p className={`font-bold ${checked ? 'line-through text-primary/80' : ''}`}>
							{item.name}
							{item.quantity && (
								<span className='m-4 font-normal text-muted-foreground'>
									{item.quantity} {item.unit}
								</span>
							)}
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
				{!isCompleted && !checked && (
					<div onClick={e => e.stopPropagation()}>
						<ActionsItemFormBaseList
							item={item}
							isDisabled={isCompleted}
							maxNameLength={200}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							successMessages={{
								update: 'Item updated',
								delete: 'Item deleted',
							}}
							isEditing={editing}
							onEditingChange={setEditing}
						/>
					</div>
				)}
				<div onClick={e => e.stopPropagation()}>
					<Checkbox
						checked={checked ?? false}
						onCheckedChange={handleToggle}
						disabled={loading || isCompleted}
						className='ml-6 mt-0.5 w-5 h-5 rounded-lg'
					/>
				</div>
			</CardContent>
		</Card>
	)
}
