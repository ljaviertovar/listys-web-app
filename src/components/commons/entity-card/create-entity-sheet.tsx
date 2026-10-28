'use client'

import { useId, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { FormField } from '../form-field/form-field'
import { SheetDialog } from '../sheet-dialog/sheet-dialog'
import type { EntityEditValues } from './entity-edit-card'

interface CreateEntitySheetProps {
	/** The control that opens the sheet. */
	trigger: ReactNode
	title: string
	description: string
	namePlaceholder: string
	secondLabel: string
	secondPlaceholder: string
	secondMax: number
	/** Label of the submit button ("Create List"); it reads "Creating…" while it saves. */
	submitLabel: string
	/** Saves the new entity. Throws to keep the sheet open; the caller shows what failed. */
	onCreate: (values: EntityEditValues) => Promise<void>
	testId: string
}

/** The create flow of a list: a sheet with its name and an optional second field. */
export function CreateEntitySheet({
	trigger,
	title,
	description,
	namePlaceholder,
	secondLabel,
	secondPlaceholder,
	secondMax,
	submitLabel,
	onCreate,
	testId,
}: CreateEntitySheetProps) {
	const id = useId()
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const schema = z.object({
		name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
		second: z.string().max(secondMax, `${secondLabel} cannot exceed ${secondMax} characters`),
	})
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EntityEditValues>({ resolver: zodResolver(schema), defaultValues: { name: '', second: '' } })

	const submit = async (values: EntityEditValues) => {
		setLoading(true)
		try {
			await onCreate(values)
			setOpen(false)
			reset()
		} catch {
			// The caller already told the user what failed; the sheet stays open with what they typed.
		} finally {
			setLoading(false)
		}
	}

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !loading && setOpen(next)}
			trigger={trigger}
			title={title}
			description={description}
			testId={testId}
		>
			<form
				onSubmit={handleSubmit(submit)}
				noValidate
				className='flex flex-col gap-5'
			>
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
						placeholder={namePlaceholder}
						disabled={loading}
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? `${id}-name-error` : undefined}
						size='lg'
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
						placeholder={secondPlaceholder}
						disabled={loading}
						aria-invalid={!!errors.second}
						aria-describedby={errors.second ? `${id}-second-error` : undefined}
						rows={3}
					/>
				</FormField>
				<p className='text-xs text-slate-500 dark:text-muted-foreground'>
					<span className='text-destructive'>*</span> Required fields
				</p>
				<div className='grid grid-cols-2 gap-3'>
					<Button
						size='primary'
						type='button'
						variant='secondary'
						disabled={loading}
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button
						size='primary'
						type='submit'
						disabled={loading}
						data-testid={`${testId}-submit`}
					>
						{loading ? (
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={2}
								aria-hidden='true'
								className='size-4 animate-spin motion-reduce:animate-none'
							/>
						) : null}
						{loading ? 'Creating…' : submitLabel}
					</Button>
				</div>
			</form>
		</SheetDialog>
	)
}
