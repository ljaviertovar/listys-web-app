import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'

import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'

interface FormFieldProps {
	/** Id of the control the label belongs to. */
	htmlFor: string
	label: ReactNode
	/** A control next to the label on the right, such as the "Forgot Password?" link. */
	labelAction?: ReactNode
	/** Help that stays under the control until there is an error to show in its place. */
	hint?: ReactNode
	required?: boolean
	error?: string | null
	children: ReactNode
	/** Identifies the field in tests; the caller says which one it is. */
	testId: string
	className?: string
	/** `mono` prints the label as on a receipt (the paper skin of the auth screens). */
	labelStyle?: 'default' | 'mono'
	/** Legacy callers share Field's native spacing. */
	density?: 'default' | 'compact'
}

/** A labelled control of an A1 form with its validation message under it: a red alert icon and the text, never colour alone. */
export function FormField({ htmlFor, label, labelAction, hint, required = false, error, children, testId, className, labelStyle = 'default' }: FormFieldProps) {
	const labelNode = (
			<FieldLabel
				htmlFor={htmlFor}
				size={labelStyle}
			>
			{label}
			{required ? (
				<span
					aria-hidden='true'
					className='text-destructive'
				>
					*
				</span>
			) : null}
		</FieldLabel>
	)

	return (
		<Field
			data-testid={testId}
			data-invalid={!!error}
			className={className}
		>
			{labelAction ? (
				<div className='flex items-center justify-between gap-3'>
					{labelNode}
					{labelAction}
				</div>
			) : (
				labelNode
			)}
			{children}
			{error ? (
				<FieldError
					id={`${htmlFor}-error`}
					role='alert'
				>
					<span className='inline-flex items-center gap-1.5'>
					<HugeiconsIcon
						icon={AlertCircleIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-3.5 shrink-0'
					/>
					{error}
					</span>
				</FieldError>
			) : hint ? (
				<FieldDescription
					id={`${htmlFor}-hint`}
				>
					{hint}
				</FieldDescription>
			) : null}
		</Field>
	)
}
