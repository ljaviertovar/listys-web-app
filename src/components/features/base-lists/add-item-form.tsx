'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBaseListItem } from '@/actions/base-lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { CATEGORIES, UNITS } from '@/data/constants'
import { createBaseListItemSchema, type CreateBaseListItemInput } from '@/lib/validations/base-list'
import { toast } from 'sonner'

interface Props {
	baseListId: string
	isLocked?: boolean
}

export function AddItemForm({ baseListId, isLocked = false }: Props) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<CreateBaseListItemInput>({
		resolver: zodResolver(createBaseListItemSchema) as any,
		defaultValues: { base_list_id: baseListId, quantity: 1 },
	})

	const onSubmit = async (data: CreateBaseListItemInput) => {
		setError(null)
		setLoading(true)
		try {
			const { error } = await createBaseListItem(data)
			if (error) throw new Error(error)

			// Reset all fields including controlled selects to clear the form UI
			reset({ base_list_id: baseListId, quantity: 1, name: '', unit: undefined, category: undefined, notes: '' })
			router.refresh()
			toast.success('Item added')
		} catch (err: any) {
			const msg = err instanceof Error ? err.message : 'Failed to add item'
			setError(msg)
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='w-full space-y-4 rounded-lg border p-4 bg-muted/30'
		>
			{isLocked && (
				<div className='rounded-md bg-muted p-3 text-sm text-muted-foreground'>
					This list is locked because it's being used in an active shopping run.
				</div>
			)}
			{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-2'>
					<Input
						placeholder='Item name *'
						{...register('name')}
						disabled={loading || isLocked}
						aria-invalid={!!errors.name}
						className={errors.name ? 'border-destructive focus-visible:ring-destructive bg-card' : 'bg-card'}
					/>
					{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
				</div>
				<div className='flex gap-2'>
					<Input
						type='number'
						step='0.1'
						placeholder='Qty *'
						min={0.1}
						max={99}
						defaultValue={1}
						{...register('quantity', { valueAsNumber: true })}
						className='w-20 bg-card'
						aria-invalid={!!errors.quantity}
						{...(errors.quantity
							? { className: 'w-20 border-destructive focus-visible:ring-destructive bg-card' }
							: {})}
						disabled={loading || isLocked}
					/>
					<Controller
						control={control}
						name='unit'
						render={({ field }) => (
							<Select
								value={field.value || ''}
								onValueChange={val => field.onChange(val || undefined)}
								disabled={loading || isLocked}
							>
								<SelectTrigger
									className={
										errors.unit ? 'w-32 border-destructive focus-visible:ring-destructive bg-card' : 'w-32 bg-card'
									}
								>
									<SelectValue placeholder='Unit' />
								</SelectTrigger>
								<SelectContent>
									{UNITS.map(u => (
										<SelectItem
											key={u}
											value={u}
										>
											{u}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<Controller
					control={control}
					name='category'
					render={({ field }) => (
						<Select
							value={field.value || ''}
							onValueChange={val => field.onChange(val || undefined)}
							disabled={loading || isLocked}
						>
							<SelectTrigger
								className={errors.category ? 'border-destructive focus-visible:ring-destructive bg-card' : 'bg-card'}
							>
								<SelectValue placeholder='Category (optional)' />
							</SelectTrigger>
							<SelectContent>
								{CATEGORIES.map(cat => (
									<SelectItem
										key={cat}
										value={cat}
									>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				<Input
					placeholder='Notes (optional)'
					{...register('notes')}
					disabled={loading || isLocked}
					className='bg-card'
				/>
			</div>

			<p className='text-xs text-muted-foreground mt-2'>
				<span className='text-destructive'>*</span> Required fields
			</p>

			<Button
				type='submit'
				disabled={loading || isLocked}
				className='w-full max-w-1/3 mx-auto flex justify-center items-center mt-8'
			>
				{loading ? (
					<>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4 animate-spin'
						/>
						Adding...
					</>
				) : (
					<>
						<HugeiconsIcon
							icon={PlusSignIcon}
							strokeWidth={2}
							data-icon='inline-start'
						/>
						Add Item
					</>
				)}
			</Button>
		</form>
	)
}
