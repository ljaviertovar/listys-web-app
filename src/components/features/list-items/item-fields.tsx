'use client'

import { useCallback, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { BalanceScaleIcon, DropletIcon, Package01Icon, RulerIcon } from '@hugeicons/core-free-icons'

import { Controller, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroupAddon } from '@/components/ui/input-group'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { FormField, getCategoryIcon } from '@/components/commons'
import { CATEGORIES, UNITS } from '@/data/constants'

import { unitOptions, type ItemFormValues } from './helpers/item-form-schema'

function getUnitIcon(unit: string) {
	if (unit === 'kg' || unit === 'lbs' || unit === 'oz' || unit === 'g') return BalanceScaleIcon
	if (unit === 'ml' || unit === 'l' || unit === 'gal') return DropletIcon
	if (unit === 'pcs' || unit === 'dozen' || unit === 'pack') return Package01Icon
	return RulerIcon
}

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
	const [popupContainer, setPopupContainer] = useState<HTMLElement | null>(null)
	const setFieldsRoot = useCallback((node: HTMLDivElement | null) => {
		// Base UI portals must remain inside Radix's modal interaction boundary.
		setPopupContainer(node?.closest<HTMLElement>('[role="dialog"], [role="alertdialog"]') ?? null)
	}, [])
	const {
		register,
		control,
		formState: { errors },
	} = form

	return (
		<div
			ref={setFieldsRoot}
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
								value={field.value}
								onValueChange={value => typeof value === 'string' && field.onChange(value)}
								disabled={disabled}
							>
								<div className='w-full' ref={unitAnchor}>
								<ComboboxInput
									id={`${idPrefix}-unit`}
									aria-invalid={!!errors.unit}
									size='lg'
									surface='form'
									placeholder='Unit'
									showTrigger
								/>
								</div>
								<ComboboxContent
									size='default'
									anchor={unitAnchor}
									container={popupContainer ?? undefined}
								>
									<ComboboxList>
										{(unit: string) => (
											<ComboboxItem key={unit} value={unit}>
												<HugeiconsIcon icon={getUnitIcon(unit)} strokeWidth={1.5} aria-hidden='true' className='size-4' />
												{unit}
											</ComboboxItem>
										)}
									</ComboboxList>
									<ComboboxEmpty>No units available.</ComboboxEmpty>
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
								value={field.value ?? null}
								onValueChange={value => field.onChange(typeof value === 'string' ? value : undefined)}
								disabled={disabled}
							>
								<div className='w-full' ref={categoryAnchor}>
								<ComboboxInput
									id={`${idPrefix}-category`}
									aria-invalid={!!errors.category}
									size='lg'
									surface='form'
									placeholder='Choose a category'
									showTrigger
								>
									{field.value ? (
										<InputGroupAddon align='inline-start' data-testid={`${idPrefix}-selected-category-icon`}>
											<HugeiconsIcon icon={getCategoryIcon(field.value)} strokeWidth={1.5} aria-hidden='true' className='size-4' />
										</InputGroupAddon>
									) : null}
								</ComboboxInput>
								</div>
								<ComboboxContent
									size='default'
									anchor={categoryAnchor}
									container={popupContainer ?? undefined}
								>
									<ComboboxList>
										{(category: string) => (
												<ComboboxItem key={category} value={category} data-testid={`${idPrefix}-category-option-${category}`}>
												<HugeiconsIcon icon={getCategoryIcon(category)} strokeWidth={1.5} aria-hidden='true' className='size-4' />
												{category}
											</ComboboxItem>
										)}
									</ComboboxList>
									<ComboboxEmpty>No categories available.</ComboboxEmpty>
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
