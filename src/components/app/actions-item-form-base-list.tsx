'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Edit02Icon, Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BaseItem {
	id: string
	name: string
	quantity?: number | null
	notes?: string | null
	unit?: string | null
}

interface Props {
	item: BaseItem
	isDisabled?: boolean
	maxNameLength?: number
	onUpdate: (id: string, data: { name?: string; quantity?: number; notes?: string }) => Promise<{ error?: string }>
	onDelete: (id: string) => Promise<{ error?: string }>
	successMessages?: {
		update: string
		delete: string
	}
	isEditing?: boolean
	onEditingChange?: (editing: boolean) => void
}

export function ActionsItemFormBaseList({
	item,
	isDisabled = false,
	maxNameLength = 200,
	onUpdate,
	onDelete,
	successMessages = {
		update: 'Item updated',
		delete: 'Item deleted',
	},
	isEditing = false,
	onEditingChange,
}: Props) {
	const [internalEditing, setInternalEditing] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const editing = onEditingChange ? isEditing : internalEditing
	const setEditing = onEditingChange || setInternalEditing

	const schema = z.object({
		name: z.string().min(1, 'Name is required').max(maxNameLength),
		quantity: z
			.number()
			.min(0.1, 'Quantity must be at least 0.1')
			.max(99, 'Quantity cannot exceed 99')
			.refine(n => Math.round(n * 10) === n * 10, 'Quantity must be in steps of 0.1'),
		notes: z.string().max(500).optional(),
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
		defaultValues: { name: item.name, quantity: item.quantity ?? 1, notes: (item as any).notes ?? '' },
	})

	const watchedName = watch('name')

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation()

		setLoading(true)
		try {
			const { error } = await onDelete(item.id)
			if (error) throw new Error(error)
			router.refresh()
			toast.success(successMessages.delete)
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
			const { error } = await onUpdate(item.id, { name: data.name, quantity: data.quantity, notes: data.notes })
			if (error) throw new Error(error)
			setEditing(false)
			router.refresh()
			toast.success(successMessages.update)
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
			<motion.div
				initial={{ opacity: 0, y: 10, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
			>
				<Card
					variant='premium'
					size='compact'
					className='transition-colors group text-base'
				>
					<CardHeader>
						<CardTitle className='font-bold'>Edit Item</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit(handleSave)}
							className='space-y-2 w-full'
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

							<Textarea
								{...register('notes')}
								className='text-base bg-card h-20'
								placeholder='Notes, eg. specific brand, flavor, etc.'
								disabled={loading}
							/>

							<div>
								{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
								{errors.quantity && <p className='text-xs text-destructive'>{errors.quantity.message}</p>}
							</div>

							<div className='flex items-center justify-end gap-2'>
								<Button
									size='sm'
									variant='outline'
									onClick={handleCancel}
									disabled={loading}
								>
									Cancel
								</Button>
								<Button
									size='sm'
									type='submit'
									disabled={loading || !watchedName?.trim()}
								>
									{loading && (
										<HugeiconsIcon
											icon={Loading03Icon}
											strokeWidth={2}
											className='h-4 w-4 animate-spin'
											data-icon='inline-start'
										/>
									)}
									{loading ? 'Saving…' : 'Save'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		)
	}

	return (
		<div className='flex gap-1'>
			<Button
				size='icon'
				variant='ghost'
				onClick={e => {
					e.stopPropagation()
					reset({ name: item.name, quantity: item.quantity ?? 1 })
					setEditing(true)
				}}
				disabled={loading || isDisabled}
				className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary'
				aria-label='Edit item'
			>
				<HugeiconsIcon
					icon={Edit02Icon}
					strokeWidth={1.5}
				/>
			</Button>
			<Button
				size='icon'
				variant='ghost'
				onClick={handleDelete}
				disabled={loading || isDisabled}
				className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive'
				aria-label='Delete item'
			>
				{loading ? (
					<HugeiconsIcon
						icon={Loading03Icon}
						strokeWidth={1.5}
						className='h-4 w-4 animate-spin'
					/>
				) : (
					<HugeiconsIcon
						icon={Delete02Icon}
						strokeWidth={1.5}
					/>
				)}
			</Button>
		</div>
	)
}
