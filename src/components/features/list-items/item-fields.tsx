'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/commons'
import { CATEGORIES, UNITS } from '@/data/constants'

import { unitOptions, type ItemFormValues } from './helpers/item-form-schema'

interface ItemFieldsProps {
	form: UseFormReturn<ItemFormValues>
	/** Prefix that keeps the field ids unique when several forms are on the page (the inline edit of each row). */
	idPrefix: string
	disabled?: boolean
	/** The category only matters when an item is added; editing keeps the one it has. */
	withCategory?: boolean
}

/** The fields shared by every item form: name, quantity with its unit, an optional category and notes. */
export function ItemFields({ form, idPrefix, disabled = false, withCategory = false }: ItemFieldsProps) {
	const {
		register,
		control,
		formState: { errors },
	} = form

	return (
		<div
			data-testid={`${idPrefix}-fields`}
			className='flex flex-col gap-5'
		>
			<FormField
				htmlFor={`${idPrefix}-name`}
				label='Name'
				required
				error={errors.name?.message}
				testId={`${idPrefix}-name-field`}
			>
				<Input
					id={`${idPrefix}-name`}
					{...register('name')}
					placeholder='e.g. Orange Juice'
					disabled={disabled}
					aria-invalid={!!errors.name}
					aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
					size='lg'
				/>
			</FormField>

			<div className='grid grid-cols-[1fr_1.2fr] items-start gap-3'>
				<FormField
					htmlFor={`${idPrefix}-quantity`}
					label='Quantity'
					required
					error={errors.quantity?.message}
					testId={`${idPrefix}-quantity-field`}
				>
					<Input
						id={`${idPrefix}-quantity`}
						type='number'
						inputMode='decimal'
						step='0.1'
						min='0.1'
						max='99'
						{...register('quantity', { valueAsNumber: true })}
						disabled={disabled}
						aria-invalid={!!errors.quantity}
						aria-describedby={errors.quantity ? `${idPrefix}-quantity-error` : undefined}
						size='lg'
					/>
				</FormField>
				<FormField
					htmlFor={`${idPrefix}-unit`}
					label='Unit'
					error={errors.unit?.message}
					testId={`${idPrefix}-unit-field`}
				>
					<Controller
						control={control}
						name='unit'
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={disabled}
							>
								<SelectTrigger
									id={`${idPrefix}-unit`}
									aria-invalid={!!errors.unit}
									size='lg'
								>
									<SelectValue placeholder='Unit' />
								</SelectTrigger>
								<SelectContent>
									{unitOptions(UNITS, field.value).map(unit => (
										<SelectItem
											key={unit}
											value={unit}
										>
											{unit}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>
			</div>

			{withCategory ? (
				<FormField
					htmlFor={`${idPrefix}-category`}
					label='Category'
					error={errors.category?.message}
					testId={`${idPrefix}-category-field`}
				>
					<Controller
						control={control}
						name='category'
						render={({ field }) => (
							<Select
								value={field.value ?? ''}
								onValueChange={value => field.onChange(value || undefined)}
								disabled={disabled}
							>
								<SelectTrigger
									id={`${idPrefix}-category`}
									aria-invalid={!!errors.category}
									size='lg'
								>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map(category => (
										<SelectItem
											key={category}
											value={category}
										>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>
			) : null}

			<FormField
				htmlFor={`${idPrefix}-notes`}
				label='Notes'
				error={errors.notes?.message}
				testId={`${idPrefix}-notes-field`}
			>
				<Textarea
					id={`${idPrefix}-notes`}
					{...register('notes')}
					placeholder={withCategory ? 'Add any notes…' : 'Notes, eg. specific brand, flavor, etc.'}
					disabled={disabled}
					aria-invalid={!!errors.notes}
					aria-describedby={errors.notes ? `${idPrefix}-notes-error` : undefined}
					
				/>
			</FormField>
		</div>
	)
}
