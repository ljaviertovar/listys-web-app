import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const alertVariants = cva(
	"grid gap-x-2.5 gap-y-0.5 rounded-2xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 has-[>[data-alert-icon]]:grid-cols-[auto_1fr] has-[>[data-alert-icon]]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 [&>[data-alert-icon]]:row-span-2 [&>[data-alert-icon]]:translate-y-0.5 w-full relative group/alert",
	{
		variants: {
			size: {
				default: '',
				dashboard: 'flex flex-1 flex-col gap-4 border-0 px-4 py-4',
			},
			variant: {
				default: 'bg-card text-card-foreground',
				destructive: 'text-feedback-error-strong bg-card *:[svg]:text-current',
				info: 'rounded-2xl border-0 bg-feedback-info-subtle text-feedback-info-strong *:[svg]:text-current',
				warning: 'rounded-2xl border-0 bg-feedback-warning-subtle text-feedback-warning-strong *:[svg]:text-current',
				success: 'rounded-2xl border-0 bg-feedback-success-subtle text-feedback-success-strong *:[svg]:text-current',
			},
		},
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
	},
)

function Alert({ className, size, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot='alert'
			data-variant={variant ?? 'default'}
			role='alert'
			className={cn(alertVariants({ size, variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-title'
			className={cn(
				'font-medium group-has-[>svg]/alert:col-start-2 group-has-[>[data-alert-icon]]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3',
				className,
			)}
			{...props}
		/>
	)
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-description'
			className={cn(
				'text-sm text-muted-foreground text-pretty group-has-[>svg]/alert:col-start-2 group-has-[>[data-alert-icon]]/alert:col-start-2 group-data-[variant=info]/alert:text-foreground group-data-[variant=warning]/alert:text-foreground group-data-[variant=success]/alert:text-foreground group-data-[variant=destructive]/alert:text-foreground [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3',
				className,
			)}
			{...props}
		/>
	)
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-action'
			className={cn('absolute top-2.5 right-3', className)}
			{...props}
		/>
	)
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
