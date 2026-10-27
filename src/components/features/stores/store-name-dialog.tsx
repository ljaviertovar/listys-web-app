'use client'

import { useId, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { FormField, SheetDialog } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createStoreSchema, type CreateStoreInput } from '@/lib/validations/store'

interface StoreNameDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	/** The name the field starts with: a proposal from the receipt, or the store's current name when renaming. */
	initialName: string
	confirmLabel: string
	onSubmit: (name: string) => void
	pending?: boolean
	/** An error from saving, shown above the buttons; `action` offers the way out (e.g. merging instead). */
	error?: string | null
	action?: ReactNode
	testId: string
}

/** One store name in the A1 sheet: saving a receipt's store as a new store, or renaming a store. */
export function StoreNameDialog({ open, onOpenChange, title, description, testId, ...props }: StoreNameDialogProps) {
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !props.pending && onOpenChange(next)}
			title={title}
			description={description}
			testId={testId}
			autoFocus
		>
			{/* Mounted only while open, so the field starts from `initialName` every time. */}
			{open ? (
				<StoreNameForm
					onCancel={() => onOpenChange(false)}
					{...props}
				/>
			) : null}
		</SheetDialog>
	)
}

type StoreNameFormProps = Omit<StoreNameDialogProps, 'open' | 'onOpenChange' | 'title' | 'description' | 'testId'> & {
	onCancel: () => void
}

function StoreNameForm({ initialName, confirmLabel, onSubmit, pending = false, error, action, onCancel }: StoreNameFormProps) {
	const nameId = useId()
	const errorId = useId()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateStoreInput>({
		resolver: zodResolver(createStoreSchema),
		defaultValues: { name: initialName },
	})

	return (
		<form
			data-testid='store-name-form'
			onSubmit={event => {
				// React bubbles `submit` through portals: never let this sheet submit a form it is opened from.
				event.stopPropagation()
				void handleSubmit(values => !pending && onSubmit(values.name))(event)
			}}
			noValidate
			className='flex flex-col gap-4'
		>
			<FormField
				htmlFor={nameId}
				label='Store Name'
				required
				error={errors.name?.message}
				testId='store-name-field'
			>
				<Input
					id={nameId}
					size='lg'
					autoComplete='off'
					maxLength={100}
					aria-required='true'
					aria-invalid={errors.name ? true : undefined}
					aria-describedby={errors.name ? `${nameId}-error` : undefined}
					disabled={pending}
					{...register('name')}
				/>
			</FormField>

			{error ? (
				<div className='flex flex-col items-start gap-2'>
					<p
						id={errorId}
						role='alert'
						className='text-sm text-destructive'
					>
						{error}
					</p>
					{action}
				</div>
			) : null}

			<DialogFooter variant='sheet'>
				<Button
					type='button'
					variant='secondary'
					size='primary'
					disabled={pending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					size='primary'
					disabled={pending}
					aria-describedby={error ? errorId : undefined}
				>
					{pending ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 animate-spin motion-reduce:animate-none'
						/>
					) : null}
					{confirmLabel}
				</Button>
			</DialogFooter>
		</form>
	)
}
