'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { createBaseListItem, createShoppingSessionItem } from '@/lib/api/endpoints'
import { broadcastListActivity, cn } from '@/utils'

import { itemFormSchema, type ItemFormValues } from './helpers/item-form-schema'
import { ItemFields } from './item-fields'

export type AddItemTarget = { context: 'base-list'; baseListId: string } | { context: 'shopping-session'; sessionId: string }

interface AddItemFormProps {
	target: AddItemTarget
	/** A list that is being shopped cannot take new items until the session ends. */
	isLocked?: boolean
	onCancel: () => void
}

const EMPTY: ItemFormValues = { name: '', quantity: 1, unit: 'pcs', category: undefined, notes: '' }

/** "Add New Item": the fields of an item and an Add Item button. It stays open after an add so several items can go in a row. */
export function AddItemForm({ target, isLocked = false, onCancel }: AddItemFormProps) {
	const id = useId()
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const form = useForm<ItemFormValues>({ resolver: zodResolver(itemFormSchema), defaultValues: EMPTY })

	const submit = async (values: ItemFormValues) => {
		setLoading(true)
		try {
			const payload = { ...values, name: values.name.trim(), notes: values.notes?.trim() || undefined }
			const result =
				target.context === 'base-list'
					? await createBaseListItem({ ...payload, base_list_id: target.baseListId, sort_order: 0 })
					: await createShoppingSessionItem({ ...payload, shopping_session_id: target.sessionId })
			if (result.error) throw new Error(result.error)

			form.reset(EMPTY)
			toast.success('Item added')
			router.refresh()
			broadcastListActivity(
				target.context === 'base-list' ? `list_activity_${target.baseListId}` : `session_activity_${target.sessionId}`,
			)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to add item')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			data-testid='add-item-form'
			onSubmit={form.handleSubmit(submit)}
			noValidate
			className='flex flex-col gap-5'
		>
			{isLocked ? (
				<p
					role='note'
					className='rounded-2xl bg-slate-100 px-3.5 py-3 text-sm leading-normal text-slate-600 dark:bg-muted dark:text-muted-foreground'
				>
					This list is locked because it is being shopped right now.
				</p>
			) : null}
			<ItemFields
				form={form}
				idPrefix={id}
				disabled={loading || isLocked}
				withCategory
			/>
			<p className='text-xs text-slate-500 dark:text-muted-foreground'>
				<span className='text-destructive'>*</span> Required fields
			</p>
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
					disabled={loading || isLocked}
				>
					<HugeiconsIcon
						icon={loading ? Loading03Icon : PlusSignIcon}
						strokeWidth={2}
						aria-hidden='true'
						className={cn('size-4', loading && 'animate-spin motion-reduce:animate-none')}
					/>
					{loading ? 'Adding…' : 'Add Item'}
				</Button>
			</div>
		</form>
	)
}
