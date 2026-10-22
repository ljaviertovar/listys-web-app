'use client'

import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

import { itemFormSchema, type ItemFormValues } from './helpers/item-form-schema'
import { ItemFields } from './item-fields'

interface EditableItem {
	id: string
	name: string
	quantity?: number | null
	unit?: string | null
	notes?: string | null
}

interface ItemEditFormProps {
	item: EditableItem
	/** Throws to keep the form open; the caller shows what failed. */
	onSubmit: (values: ItemFormValues) => Promise<void>
	onCancel: () => void
}

/** "Edit Item": the form that replaces an item's row inside its category, with its fields and a Cancel/Save pair. */
export function ItemEditForm({ item, onSubmit, onCancel }: ItemEditFormProps) {
	const id = useId()
	const [loading, setLoading] = useState(false)
	const form = useForm<ItemFormValues>({
		resolver: zodResolver(itemFormSchema),
		defaultValues: {
			name: item.name,
			quantity: item.quantity ?? 1,
			unit: item.unit || 'pcs',
			notes: item.notes ?? '',
		},
	})
	const { setFocus } = form

	useEffect(() => {
		setFocus('name')
	}, [setFocus])

	const submit = async (values: ItemFormValues) => {
		setLoading(true)
		try {
			await onSubmit(values)
		} catch {
			// The caller already told the user what failed; the form stays open so nothing typed is lost.
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			data-testid={`item-edit-form-${item.id}`}
			onSubmit={form.handleSubmit(submit)}
			noValidate
			className='flex flex-col gap-4 p-4'
		>
			<h3 className='font-display text-base leading-[1.5] font-semibold '>Edit Item</h3>
			<ItemFields
				form={form}
				idPrefix={`${id}-edit`}
				disabled={loading}
			/>
			<div className='grid grid-cols-2 gap-3'>
				<Button
					size='primary'
					type='button'
					variant='secondary'
					onClick={onCancel}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					size='primary'
					type='submit'
					disabled={loading}
				>
					{loading ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 animate-spin motion-reduce:animate-none'
						/>
					) : null}
					{loading ? 'Saving Changes…' : 'Save Changes'}
				</Button>
			</div>
		</form>
	)
}
