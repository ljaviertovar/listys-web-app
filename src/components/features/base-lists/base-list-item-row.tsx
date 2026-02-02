'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Delete02Icon, Edit02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

import { deleteBaseListItem, updateBaseListItem } from '@/actions/base-lists'

import type { BaseListItem } from '@/features/base-lists/types'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
	item: BaseListItem
	isLocked?: boolean
}

export function BaseListItemRow({ item, isLocked = false }: Props) {
	const [editing, setEditing] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const schema = z.object({
		name: z.string().min(1, 'Name is required').max(100),
		quantity: z
			.number()
			.min(0.1, 'Quantity must be at least 0.1')
			.max(99, 'Quantity cannot exceed 99')
			.refine(n => Math.round(n * 10) === n * 10, 'Quantity must be in steps of 0.1'),
	})

	type FormData = z.infer<typeof schema>

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { name: item.name, quantity: item.quantity ?? 1 },
	})

	const watchedName = watch('name')

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

	const handleSave = async (data: FormData) => {
		setLoading(true)
		try {
			const { error } = await updateBaseListItem(item.id, {
				name: data.name,
				quantity: data.quantity ?? 1,
			})
			if (error) throw new Error(error)
			setEditing(false)
			router.refresh()
			toast.success('Item actualizado')
		} catch (err) {
			console.error('Failed to update item:', err)
			const msg = err instanceof Error ? err.message : 'Failed to update item'
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	const handleCancel = () => {
		reset({ name: item.name, quantity: item.quantity ?? 1 })
		setEditing(false)
	}

	if (editing) {
		return (
			<Card
				size='sm'
				className='hover:bg-primary/1 hover:border-primary/50 transition-colors cursor-pointer group text-base'
			>
				<CardContent className='flex flex-col gap-2'>
					<form
						onSubmit={handleSubmit(handleSave)}
						className='space-y-2'
					>
						<div className='flex flex-col sm:flex-row gap-2 w-full'>
							<Input
								{...register('name')}
								className='flex-1 w-full bg-card text-base h-10 py-2'
								aria-invalid={!!errors.name}
								disabled={loading}
								required
							/>
							<Input
								{...register('quantity', {
									// convert comma decimals to dot and coerce to number
									setValueAs: v => (typeof v === 'string' ? Number(v.replace(',', '.')) : v),
								})}
								type='number'
								inputMode='decimal'
								step='0.1'
								min='0.1'
								max='99'
								className='w-full sm:w-20 bg-card text-base h-10 py-2'
								aria-invalid={!!errors.quantity}
								disabled={loading}
								required
							/>
						</div>

						<div>
							{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
							{errors.quantity && <p className='text-xs text-destructive'>{errors.quantity.message}</p>}
						</div>

						<div className='flex items-center justify-end gap-2'>
							<Button
								size='sm'
								type='submit'
								disabled={loading || !watchedName?.trim()}
							>
								Save
							</Button>
							<Button
								size='sm'
								variant='outline'
								onClick={handleCancel}
								disabled={loading}
							>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
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

							<span className='m-4 font-normal text-muted-foreground'>
								{item.quantity ?? 1} {item.unit}
							</span>
						</p>
						<div className='flex gap-2'>{item.category && <Badge variant={'category'}>{item.category}</Badge>}</div>
						{item.notes && (
							<p className='text-xs md:text-sm text-muted-foreground'>
								{'> '} {item.notes}
							</p>
						)}
					</div>
				</div>
				<div className='flex gap-1'>
					<Button
						size='icon'
						variant='ghost'
						onClick={() => {
							reset({ name: item.name, quantity: item.quantity ?? 1 })
							setEditing(true)
						}}
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
			</CardContent>
		</Card>
	)
}
