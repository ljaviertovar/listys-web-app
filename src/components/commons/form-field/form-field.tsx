import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'

import { Label } from '@/components/ui/label'
import { cn } from '@/utils'

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
}

/** A labelled control of an A1 form with its validation message under it: a red alert icon and the text, never colour alone. */
export function FormField({ htmlFor, label, labelAction, hint, required = false, error, children, testId, className }: FormFieldProps) {
	const labelNode = (
		<Label htmlFor={htmlFor}>
			{label}
			{required ? (
				<span
					aria-hidden='true'
					className='text-destructive'
				>
					*
				</span>
			) : null}
		</Label>
	)

	return (
		<div
			data-testid={testId}
			className={cn('flex flex-col gap-2', className)}
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
				<p
					id={`${htmlFor}-error`}
					role='alert'
					className='flex items-center gap-1.5 text-xs leading-[1.3] font-medium text-red-700 dark:text-red-400'
				>
					<HugeiconsIcon
						icon={AlertCircleIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-3.5 shrink-0'
					/>
					{error}
				</p>
			) : hint ? (
				<p
					id={`${htmlFor}-hint`}
					className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'
				>
					{hint}
				</p>
			) : null}
		</div>
	)
}
