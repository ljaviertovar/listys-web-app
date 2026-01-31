'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Delete02Icon, Edit02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

import { deleteBaseListItem, updateBaseListItem } from '@/actions/base-lists'

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
		setLoading(true)
		try {
			const { error } = await deleteBaseListItem(item.id)
			if (error) throw new Error(error)
			router.refresh()
			toast.success('Item eliminado')
		} catch (err) {
			console.error('Failed to delete item:', err)
			const msg = err instanceof Error ? err.message : 'Failed to delete item'
			toast.error(msg)
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
			<div className='flex flex-col gap-3 rounded-lg border p-3'>
				<div className='flex flex-col sm:flex-row gap-2 w-full'>
					<Input
						value={name}
						onChange={e => setName(e.target.value)}
						className='flex-1 w-full'
					/>
					<Input
						type='number'
						inputMode='decimal'
						step='0.01'
						value={quantity}
						onChange={e => setQuantity(e.target.value)}
						className='w-full sm:w-20'
					/>
				</div>
				<div className='flex items-center justify-end gap-2'>
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
			</div>
		)
	}

	return (
		<div className='flex items-center justify-between rounded-sm border p-2 hover:bg-muted/30'>
			<div className='flex flex-1 items-center gap-2 justify-start'>
				<div className='flex-1'>
					<p className='font-bold mb-1'>
						{item.name}

						<span className='m-4 font-normal text-muted-foreground'>
							{item.quantity} {item.unit}
						</span>
					</p>
					<div className='flex gap-2 mb-1'>{item.category && <Badge variant={'category'}>{item.category}</Badge>}</div>
					{item.notes && <p className='text-xs md:text-sm text-muted-foreground'>:{item.notes}</p>}
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
