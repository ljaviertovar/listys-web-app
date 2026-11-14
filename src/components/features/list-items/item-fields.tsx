'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
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
	const unitAnchor = useComboboxAnchor()
	const categoryAnchor = useComboboxAnchor()
	const {
		register,
		control,
		formState: { errors },
	} = form

	return (
		<div
			data-testid={`${idPrefix}-fields`}
			className='flex flex-col gap-1'
		>
			<FormField
				htmlFor={`${idPrefix}-name`}
				label='Item Name'
				required
				error={errors.name?.message}
				testId={`${idPrefix}-name-field`}
				density='compact'
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

			<div className='grid grid-cols-2 items-start gap-3'>
				<FormField
					htmlFor={`${idPrefix}-quantity`}
					label='Quantity'
					required
					error={errors.quantity?.message}
					testId={`${idPrefix}-quantity-field`}
					density='compact'
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
					density='compact'
				>
					<Controller
						control={control}
						name='unit'
						render={({ field }) => (
							<Combobox
								items={unitOptions(UNITS, field.value)}
								itemToStringLabel={value => value}
								filter={(item, query, getLabel) => (getLabel?.(item) ?? String(item)).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
								value={field.value}
								onValueChange={value => typeof value === 'string' && field.onChange(value)}
								disabled={disabled}
							>
								<div className='w-full' ref={unitAnchor}>
								<ComboboxInput
									id={`${idPrefix}-unit`}
									aria-invalid={!!errors.unit}
									size='lg'
									placeholder='Unit'
									showTrigger
								/>
								</div>
								<ComboboxContent anchor={unitAnchor}>
									<ComboboxList>
										{(unit: string) => <ComboboxItem key={unit} value={unit}>{unit}</ComboboxItem>}
									</ComboboxList>
									<ComboboxEmpty>No units found.</ComboboxEmpty>
								</ComboboxContent>
							</Combobox>
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
					density='compact'
				>
					<Controller
						control={control}
						name='category'
						render={({ field }) => (
							<Combobox
								items={CATEGORIES}
								itemToStringLabel={value => value}
								filter={(item, query, getLabel) => (getLabel?.(item) ?? String(item)).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
								value={field.value ?? ''}
								onValueChange={value => typeof value === 'string' && field.onChange(value || undefined)}
								disabled={disabled}
							>
								<div className='w-full' ref={categoryAnchor}>
								<ComboboxInput
									id={`${idPrefix}-category`}
									aria-invalid={!!errors.category}
									size='lg'
									placeholder='Choose a category'
									showTrigger
								/>
								</div>
								<ComboboxContent anchor={categoryAnchor}>
									<ComboboxList>
										{(category: string) => <ComboboxItem key={category} value={category}>{category}</ComboboxItem>}
									</ComboboxList>
									<ComboboxEmpty>No categories found.</ComboboxEmpty>
								</ComboboxContent>
							</Combobox>
						)}
					/>
				</FormField>
			) : null}

			<FormField
				htmlFor={`${idPrefix}-notes`}
				label='Notes'
				error={errors.notes?.message}
				testId={`${idPrefix}-notes-field`}
				density='compact'
			>
				<Textarea
					id={`${idPrefix}-notes`}
					{...register('notes')}
					placeholder={withCategory ? 'Brand, size…' : 'Notes, eg. specific brand, flavor, etc.'}
					disabled={disabled}
					aria-invalid={!!errors.notes}
					aria-describedby={errors.notes ? `${idPrefix}-notes-error` : undefined}
					size='compact'

				/>
			</FormField>
		</div>
	)
}
