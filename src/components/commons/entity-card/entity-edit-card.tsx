'use client'

import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { A1_ACTION, A1_SECONDARY, CARD_SURFACE, FIELD_AREA, FIELD_CONTROL } from '@/components/app/helpers/a1-surface'
import { cn } from '@/utils'

import { FormField } from '../form-field/form-field'

export interface EntityEditValues {
	name: string
	second: string
}

interface EntityEditCardProps {
	title: string
	/** Label of the optional second field: "Description" for a group, "Notes" for a list. */
	secondLabel: string
	secondPlaceholder: string
	secondMax: number
	initial: EntityEditValues
	/** Throws to keep the form open with the loading state cleared; the caller shows the error. */
	onSubmit: (values: EntityEditValues) => Promise<void>
	onCancel: () => void
	testId: string
}

/** The card of a group or list while it is being renamed: the same surface in place, with its fields and a Cancel/Save pair. */
export function EntityEditCard({
	title,
	secondLabel,
	secondPlaceholder,
	secondMax,
	initial,
	onSubmit,
	onCancel,
	testId,
}: EntityEditCardProps) {
	const id = useId()
	const [loading, setLoading] = useState(false)
	const schema = z.object({
		name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
		second: z.string().max(secondMax, `${secondLabel} cannot exceed ${secondMax} characters`),
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EntityEditValues>({ resolver: zodResolver(schema), defaultValues: initial })

	const submit = async (values: EntityEditValues) => {
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
			data-testid={testId}
			onSubmit={handleSubmit(submit)}
			noValidate
			className={cn('flex flex-col gap-4 p-4', CARD_SURFACE)}
		>
			<h2 className='font-display text-base leading-[1.5] font-semibold tracking-[-0.005em]'>{title}</h2>
			<FormField
				htmlFor={`${id}-name`}
				label='Name'
				required
				error={errors.name?.message}
				testId={`${testId}-name-field`}
			>
				<Input
					id={`${id}-name`}
					{...register('name')}
					disabled={loading}
					aria-invalid={!!errors.name}
					aria-describedby={errors.name ? `${id}-name-error` : undefined}
					className={FIELD_CONTROL}
				/>
			</FormField>
			<FormField
				htmlFor={`${id}-second`}
				label={secondLabel}
				error={errors.second?.message}
				testId={`${testId}-second-field`}
			>
				<Textarea
					id={`${id}-second`}
					{...register('second')}
					disabled={loading}
					placeholder={secondPlaceholder}
					aria-invalid={!!errors.second}
					aria-describedby={errors.second ? `${id}-second-error` : undefined}
					className={cn(FIELD_AREA, 'h-24 resize-none')}
				/>
			</FormField>
			<div className='grid grid-cols-2 gap-3'>
				<Button
					type='button'
					variant='outline'
					onClick={onCancel}
					disabled={loading}
					className={cn(A1_ACTION, A1_SECONDARY)}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					disabled={loading}
					className={A1_ACTION}
				>
					{loading ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 animate-spin motion-reduce:animate-none'
						/>
					) : null}
					{loading ? 'Saving…' : 'Save'}
				</Button>
			</div>
		</form>
	)
}
