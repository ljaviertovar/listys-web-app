'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { toggleShoppingRunItem, updateShoppingRunItem, deleteShoppingRunItem } from '@/actions/shopping-runs'
import type { ShoppingRunItem } from '@/features/shopping-runs/types'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ActionsItemFormBaseList } from '@/components/app/actions-item-form-base-list'

interface Props {
	item: ShoppingRunItem
	isCompleted?: boolean
}

export function ShoppingRunItemRow({ item, isCompleted = false }: Props) {
	const [checked, setChecked] = useState(item.checked)
	const [loading, setLoading] = useState(false)
	const [editing, setEditing] = useState(false)
	const router = useRouter()

	const handleToggle = async () => {
		if (isCompleted) return // Don't allow toggling completed runs

		const newChecked = !checked
		setChecked(newChecked) // Optimistic update
		setLoading(true)

		try {
			const { error } = await toggleShoppingRunItem(item.id, newChecked)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			setChecked(!newChecked) // Revert on error
			console.error('Failed to toggle item:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdate = async (id: string, data: { name: string; quantity: number }) => {
		return await updateShoppingRunItem(id, data)
	}

	const handleDelete = async (id: string) => {
		return await deleteShoppingRunItem(id)
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
			className={`transition-all cursor-pointer ${checked ? 'bg-muted' : 'hover:bg-muted'}`}
		>
			<CardContent className='flex flex-row items-center'>
				<div onClick={e => e.stopPropagation()}>
					<Checkbox
						checked={checked ?? false}
						onCheckedChange={handleToggle}
						disabled={loading || isCompleted}
						className='mt-0.5 w-5 h-5'
					/>
				</div>

				<div className='flex flex-1 items-center gap-2 justify-start ml-3'>
					<div className='flex-1 space-y-1'>
						<p className={`font-bold ${checked ? 'line-through text-muted-foreground' : ''}`}>
							{item.name}
							{item.quantity && (
								<span className='m-4 font-normal text-muted-foreground'>
									{item.quantity} {item.unit}
								</span>
							)}
						</p>
						<div className='flex gap-2'>{item.category && <Badge variant={'category'}>{item.category}</Badge>}</div>
						{item.notes && (
							<p className='text-xs md:text-sm text-muted-foreground'>
								{'> '} {item.notes}
							</p>
						)}
					</div>
				</div>
				{!isCompleted && (
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
			</CardContent>
		</Card>
	)
}
