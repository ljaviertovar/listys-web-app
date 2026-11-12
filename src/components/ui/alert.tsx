import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const alertVariants = cva(
	"grid gap-0.5 rounded-lg border px-4 py-3 text-left text-xs md:text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive: 'text-destructive bg-card *:[svg]:text-current',
				'destructive-soft': 'rounded-2xl border-0 bg-feedback-error-tint px-3.5 font-medium text-feedback-error dark:bg-feedback-error-tint dark:text-feedback-error *:[svg]:text-current',
				info: 'rounded-2xl border-0 bg-feedback-info-subtle text-feedback-info-strong *:[svg]:text-current',
				warning: 'rounded-2xl border-0 bg-feedback-warning-subtle text-feedback-warning-strong *:[svg]:text-current',
				success: 'rounded-2xl border-0 bg-feedback-success-subtle text-feedback-success-strong *:[svg]:text-current',
				// The blue sibling of receipt-warning: guidance that is not a problem (Prices by Store without data).
				'receipt-info':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-0 bg-feedback-info-subtle px-3 py-3 text-feedback-info-strong [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:leading-[1.4]',
				// The green sibling of receipt-warning: a comparison that found nothing to decide ("All 14 items match your Pantry").
				'receipt-success':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-0 inset-ring-1 inset-ring-feedback-success-tint bg-feedback-success-subtle px-3 py-3 text-feedback-success-strong [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:text-xs **:data-[slot=alert-description]:leading-[1.4] **:data-[slot=alert-description]:text-body',
				// A note about the receipt flow that is not a state of the receipt (the upload's "Review before saving"): blue, body 14/1.5.
				'receipt-notice':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-0 inset-ring-1 inset-ring-feedback-info-tint bg-feedback-info-subtle px-3 py-3 text-feedback-info-strong [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.4] **:data-[slot=alert-description]:text-sm **:data-[slot=alert-description]:leading-normal **:data-[slot=alert-description]:[text-wrap-style:auto] **:data-[slot=alert-description]:text-body',
				'receipt-warning':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-0 inset-ring-1 inset-ring-feedback-warning-tint bg-feedback-warning-subtle px-3 py-3 text-feedback-warning-strong [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:text-sm **:data-[slot=alert-description]:leading-normal **:data-[slot=alert-description]:text-body',
				// The red sibling of receipt-warning: something that did not happen and what is still safe (a save that did not go through).
				'receipt-danger':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-0 inset-ring-1 inset-ring-feedback-error-tint bg-feedback-error-subtle px-3 py-3 text-feedback-error-strong [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:leading-[1.4]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot='alert'
			role='alert'
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-title'
			className={cn(
				'font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3',
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
				'text-xs text-balance md:text-sm md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3',
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
