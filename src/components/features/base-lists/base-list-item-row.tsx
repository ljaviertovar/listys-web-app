'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBaseListItem, updateBaseListItem } from '@/actions/base-lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import type { BaseListItem } from '@/features/base-lists/types'

interface Props {
	item: BaseListItem
	isLocked?: boolean
}

export function BaseListItemRow({ item, isLocked = false }: Props) {
	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(item.name)
	const [quantity, setQuantity] = useState(item.quantity?.toString() || '1')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		if (!confirm('Delete this item?')) return

		setLoading(true)
		try {
			const { error } = await deleteBaseListItem(item.id)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to delete item:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		setLoading(true)
		try {
			const { error } = await updateBaseListItem(item.id, {
				name,
				quantity: parseFloat(quantity) || 1,
			})
			if (error) throw new Error(error)
			setEditing(false)
			router.refresh()
		} catch (err) {
			console.error('Failed to update item:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleCancel = () => {
		setName(item.name)
		setQuantity(item.quantity?.toString() || '1')
		setEditing(false)
	}

	if (editing) {
		return (
			<div className='flex items-center gap-2 rounded-lg border p-3'>
				<Input
					value={name}
					onChange={e => setName(e.target.value)}
					className='flex-1'
				/>
				<Input
					type='number'
					step='0.01'
					value={quantity}
					onChange={e => setQuantity(e.target.value)}
					className='w-20'
				/>
				<Button
					size='icon'
					variant='ghost'
					onClick={handleSave}
					disabled={loading}
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={2}
					/>
				</Button>
				<Button
					size='icon'
					variant='ghost'
					onClick={handleCancel}
					disabled={loading}
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={2}
					/>
				</Button>
			</div>
		)
	}

	return (
		<div className='flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50'>
			<div className='flex flex-1 items-center gap-3'>
				<div className='flex-1'>
					<p className='font-medium'>{item.name}</p>
					<div className='flex gap-2 text-sm text-muted-foreground'>
						<span>
							{item.quantity} {item.unit}
						</span>
						{item.category && <Badge variant='secondary'>{item.category}</Badge>}
					</div>
					{item.notes && <p className='text-sm text-muted-foreground'>:{item.notes}</p>}
				</div>
			</div>
			<div className='flex gap-1'>
				<Button
					size='icon'
					variant='ghost'
					onClick={() => setEditing(true)}
					disabled={loading || isLocked}
				>
					<HugeiconsIcon
						icon={Edit02Icon}
						strokeWidth={2}
					/>
				</Button>
				<Button
					size='icon'
					variant='ghost'
					onClick={handleDelete}
					disabled={loading || isLocked}
				>
					<HugeiconsIcon
						icon={Delete02Icon}
						strokeWidth={2}
					/>
				</Button>
			</div>
		</div>
	)
}
