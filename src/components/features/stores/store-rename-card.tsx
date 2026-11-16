'use client'

import { useId, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { FormField } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createStoreSchema, type CreateStoreInput } from '@/lib/validations/store'

interface StoreRenameCardProps {
	initialName: string
	description: string
	onCancel: () => void
	onSubmit: (name: string) => void
	pending?: boolean
	error?: string | null
	action?: ReactNode
	testId: string
}

/** Replaces the selected store card while its name is being edited. */
export function StoreRenameCard({
	initialName,
	description,
	onCancel,
	onSubmit,
	pending = false,
	error,
	action,
	testId,
}: StoreRenameCardProps) {
	const nameId = useId()
	const errorId = useId()
	const { register, handleSubmit, formState: { errors } } = useForm<CreateStoreInput>({
		resolver: zodResolver(createStoreSchema),
		defaultValues: { name: initialName },
	})

	return (
		<Card data-testid={testId}><CardContent>
		<form
			onSubmit={event => {
				event.stopPropagation()
				void handleSubmit(values => !pending && onSubmit(values.name))(event)
			}}
			noValidate
			className='flex flex-col gap-3'
		>
			<CardTitle><h2>Rename Store</h2></CardTitle>
			<FormField
				htmlFor={nameId}
				label='Store Name'
				required
				hint={description}
				error={errors.name?.message}
				testId={`${testId}-name-field`}
			>
				<Input
					id={nameId}
					size='lg'
					autoFocus
					autoComplete='off'
					maxLength={100}
					placeholder='Store name'
					aria-required='true'
					aria-invalid={errors.name ? true : undefined}
					aria-describedby={errors.name ? `${nameId}-error` : `${nameId}-hint`}
					disabled={pending}
					{...register('name')}
				/>
			</FormField>

			{error ? (
				<div className='flex flex-col items-start gap-2'>
					<p id={errorId} role='alert' className='text-sm text-destructive'>{error}</p>
					{action}
				</div>
			) : null}

			<div className='grid grid-cols-2 gap-3'>
				<Button type='button' variant='outline' size='default' disabled={pending} onClick={onCancel}>
					Cancel
				</Button>
				<Button type='submit' size='default' disabled={pending} aria-describedby={error ? errorId : undefined}>
					{pending ? <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} aria-hidden='true' className='size-4 animate-spin motion-reduce:animate-none' /> : null}
					{pending ? 'Saving…' : 'Save Name'}
				</Button>
			</div>
		</form>
		</CardContent></Card>
	)
}
