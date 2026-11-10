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
				// A failed action reported at the top of a form: soft red wash, no border, red-700 text.
				'destructive-soft': 'rounded-xl border-transparent bg-red-50 px-3.5 font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300 *:[svg]:text-current',
				info: 'border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-blue-400 *:[svg]:text-blue-700 dark:*:[svg]:text-blue-400',
				warning:
					'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-400 *:[svg]:text-amber-700 dark:*:[svg]:text-amber-400',
				// The blue sibling of receipt-warning: guidance that is not a problem (Prices by Store without data).
				'receipt-info':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-blue-200 bg-blue-50 px-3 py-3 text-blue-900 [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:leading-[1.4] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
				'receipt-warning':
					'grid-cols-[auto_1fr] gap-x-3 rounded-2xl border-amber-200 bg-amber-50 px-3 py-3 text-amber-800 [&>span]:row-span-2 **:data-[slot=alert-title]:text-sm **:data-[slot=alert-title]:leading-[1.3] **:data-[slot=alert-description]:leading-[1.4] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
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
