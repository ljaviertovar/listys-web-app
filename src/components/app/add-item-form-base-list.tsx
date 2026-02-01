'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { createBaseListItem } from '@/actions/base-lists'
import { createShoppingRunItem } from '@/actions/shopping-runs'

import { z } from 'zod'
import { createBaseListItemSchema as baseListSchema, type CreateBaseListItemInput } from '@/lib/validations/base-list'
import { createShoppingRunItemSchema as shoppingRunSchema, type CreateShoppingRunItemInput } from '@/lib/validations/shopping-run'

import { CATEGORIES, UNITS } from '@/data/constants'

type Props =
	| { context: 'base-list'; baseListId: string; isLocked?: boolean; onSuccess?: () => void }
	| { context: 'shopping-run'; runId: string; onSuccess?: () => void }

export function AddItemFormBaseList(props: Props) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const isBaseList = props.context === 'base-list'
	const isLocked = isBaseList ? props.isLocked : false

	// Patch the schema to make 'unit' required
	const requiredUnitSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
		schema.extend({ unit: z.string().min(1, 'Unit is required') })

	const schema = isBaseList
		? requiredUnitSchema(baseListSchema)
		: requiredUnitSchema(shoppingRunSchema)

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<CreateBaseListItemInput | CreateShoppingRunItemInput>({
		resolver: zodResolver(schema) as any,
		defaultValues: isBaseList
			? { base_list_id: props.baseListId, quantity: 1, unit: 'pcs' }
			: { shopping_run_id: props.runId, quantity: 1, unit: 'pcs' },
	})

	const onSubmit = async (data: CreateBaseListItemInput | CreateShoppingRunItemInput) => {
		setError(null)
		setLoading(true)
		try {
			const result = isBaseList
				? await createBaseListItem(data as CreateBaseListItemInput)
				: await createShoppingRunItem(data as CreateShoppingRunItemInput)

			if (result.error) throw new Error(result.error)

			// Reset all fields including controlled selects to clear the form UI
			if (isBaseList) {
				reset({
					base_list_id: props.baseListId,
					quantity: 1,
					name: '',
					unit: 'pcs',
					category: undefined,
					notes: '',
				})
			} else {
				reset({ shopping_run_id: props.runId, quantity: 1, name: '', unit: 'pcs', category: undefined, notes: '' })
			}
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
			className='space-y-4'
		>
			{isLocked && (
				<div className='rounded-md bg-accent p-3 text-sm text-accent-foreground'>
					This list is locked because it's being used in an active shopping run.
				</div>
			)}
			{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-2 sm:col-span-2'>
					<Label htmlFor='name'>
						Item Name <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='name'
						placeholder='e.g., Milk'
						{...register('name')}
						disabled={loading || isLocked}
						aria-invalid={!!errors.name}
						className={errors.name ? 'border-destructive focus-visible:ring-destructive text-base' : 'text-base'}
					/>
					{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='quantity'>
						Quantity <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='quantity'
						type='number'
						step='0.1'
						min='0.1'
						placeholder='e.g., 2'
						{...register('quantity', { valueAsNumber: true })}
						disabled={loading || isLocked}
						aria-invalid={!!errors.quantity}
						className={errors.quantity ? 'border-destructive focus-visible:ring-destructive text-base' : 'text-base'}
					/>
					{errors.quantity && <p className='text-xs text-destructive'>{errors.quantity.message}</p>}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='unit'>Unit</Label>
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
									id='unit'
									className={errors.unit ? 'border-destructive focus-visible:ring-destructive text-base' : 'text-base'}
								>
									<SelectValue placeholder='Select unit' />
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
					{errors.unit && <p className='text-xs text-destructive'>{errors.unit.message}</p>}
				</div>
			</div>

			<div className='space-y-2 sm:col-span-2'>
				<Label htmlFor='category'>Category</Label>
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
								id='category'
								className={errors.category ? 'border-destructive focus-visible:ring-destructive text-base' : 'text-base'}
							>
								<SelectValue placeholder='Select category' />
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
				{errors.category && <p className='text-xs text-destructive'>{errors.category.message}</p>}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='notes'>Notes</Label>
				<Textarea
					id='notes'
					{...register('notes')}
					placeholder='Add any notes...'
					rows={2}
					disabled={loading || isLocked}
					className={errors.notes ? 'border-destructive focus-visible:ring-destructive text-base' : 'text-base'}
				/>
				{errors.notes && <p className='text-xs text-destructive'>{errors.notes.message}</p>}
			</div>

			<p className='text-xs text-muted-foreground mt-2'>
				<span className='text-destructive'>*</span> Required fields
			</p>

			<Button
				type='submit'
				disabled={loading || isLocked}
				className='w-full'
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
