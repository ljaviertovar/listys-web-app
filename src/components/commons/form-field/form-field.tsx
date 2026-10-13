import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'

import { Label } from '@/components/ui/label'
import { cn } from '@/utils'

interface FormFieldProps {
	/** Id of the control the label belongs to. */
	htmlFor: string
	label: ReactNode
	required?: boolean
	error?: string | null
	children: ReactNode
	/** Identifies the field in tests; the caller says which one it is. */
	testId: string
	className?: string
}

/** A labelled control of an A1 form with its validation message under it: a red alert icon and the text, never colour alone. */
export function FormField({ htmlFor, label, required = false, error, children, testId, className }: FormFieldProps) {
	return (
		<div
			data-testid={testId}
			className={cn('flex flex-col gap-2', className)}
		>
			<Label
				htmlFor={htmlFor}
				className='text-sm font-semibold'
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
			</Label>
			{children}
			{error ? (
				<p
					id={`${htmlFor}-error`}
					role='alert'
					className='flex items-center gap-1.5 text-[12.5px] leading-[1.3] font-medium text-red-700 dark:text-red-400'
				>
					<HugeiconsIcon
						icon={AlertCircleIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-3.5 shrink-0'
					/>
					{error}
				</p>
			) : null}
		</div>
	)
}
