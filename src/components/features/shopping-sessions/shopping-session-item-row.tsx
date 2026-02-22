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
} from '@/actions/shopping-sessions'
import type { ShoppingSessionItem } from '@/features/shopping-sessions/types'
import { Badge } from '@/components/ui/badge'
import { ActionsItemFormBaseList } from '@/components/app/actions-item-form-base-list'

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
			variant='premium'
			size='compact'
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			className={`group cursor-pointer relative overflow-hidden transition-all duration-300 hover:bg-primary/1 hover:border-primary/50 ${checked ? 'opacity-80 shadow-none ' : ''}`}
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
							className={`truncate text-sm font-semibold tracking-tight md:text-base ${
								checked ? 'text-muted-foreground/90 italic line-through' : 'text-foreground'
							}`}
						>
							{item.name}
						</p>

						{item.notes && <p className='mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground'>{item.notes}</p>}
					</div>
				</div>

				<div className='ml-3 flex items-center gap-2'>
					{!isCompleted && !checked && (
						<div
							onClick={e => e.stopPropagation()}
							className='transition-opacity md:opacity-0 md:group-hover:opacity-100'
						>
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
							className='h-5 w-5 rounded-md transition-all duration-300'
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
