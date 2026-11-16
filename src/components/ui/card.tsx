import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

function Card({
	className,
	size = 'default',
	variant = 'default',
	layout = 'default',
	side = 'left',
	interactive = false,
	tone = 'default',
	...props
}: React.ComponentProps<'div'> & {
	/** `compact`, `tight` and `flush` drop the gap between the parts of the card and shrink its padding (a card of list rows). */
	size?:
		| 'default'
		| 'sm'
		| 'compact'
		| 'tight'
		| 'flush'
		| 'dashboard'
		| 'dashboard-compact'
		| 'receipt'
		| 'trip'
		| 'object'
		| 'list'
		| 'stat'
		| 'saved'
		| 'spending'
		| 'notice'
	variant?: 'default' | 'premium' | 'accent' | 'ghost' | 'stat'
	tone?: 'default' | 'info' | 'success' | 'danger' | 'muted'
	layout?: 'default' | 'horizontal'
	side?: 'left' | 'right'
	/** Lifts the shadow on hover: a card that holds rows or links to somewhere. */
	interactive?: boolean
}) {
	return (
		<div
			data-slot='card'
			data-size={size}
			data-variant={variant}
			data-layout={layout}
			data-side={side}
			data-tone={tone}
			className={cn(
				'group/card flex flex-col overflow-hidden rounded-4xl border bg-card text-sm text-card-foreground shadow-sm transition-shadow motion-reduce:transition-none',
				layout === 'default' && 'gap-6 py-6',
				layout === 'horizontal' && 'p-0 gap-0 md:flex-row',
				size === 'compact' && 'gap-0 py-3 md:py-4',
				size === 'tight' && 'gap-0 p-3 md:p-4',
				size === 'flush' && 'gap-0 p-3 md:p-4',
				// Dashboard sections keep tight vertical spacing with a smaller mobile inset.
				size === 'dashboard' && 'gap-0 px-2 py-3 md:p-4',
				size === 'dashboard-compact' && 'gap-0 p-2 md:p-4',
				// Object cards use the shared 24px surface with 14px inset at every viewport.
				size === 'receipt' && 'gap-0 p-3.5 md:p-3.5',
				size === 'trip' && 'gap-0 p-3.5 md:p-3.5',
				// The object card (a list, a store, a receipt, a trip): 16px padding at every viewport, and `relative` so its footer link can cover it.
				size === 'object' && 'relative gap-0 p-4',
				// A card of collapsible categories: the 44px Collapse All button carries its own top space (canvas v4).
				size === 'list' && 'gap-3 p-4',
				size === 'stat' && 'gap-2.5 p-3 md:p-4',
				size === 'saved' && 'gap-4 p-4 md:p-6',
				// Monthly spending uses the saved surface without an internal gap.
				size === 'spending' && 'gap-0 p-4 md:p-6',
				// A notice that explains a state and what to do about it (a receipt that could not be read): 16px padding, 12px between its parts.
				size === 'notice' && 'gap-3 p-4',
				variant === 'stat' && 'rounded-2xl shadow-none ring-1 ring-inset ring-slate-200 dark:ring-border',
				tone === 'info' &&
					'bg-feedback-info-subtle text-feedback-info-strong shadow-none ring-1 ring-inset ring-feedback-info-tint dark:bg-feedback-info-subtle dark:text-feedback-info-strong dark:ring-feedback-info-tint',
				tone === 'success' &&
					'bg-feedback-success-subtle text-feedback-success-strong shadow-none ring-1 ring-inset ring-feedback-success-tint dark:bg-feedback-success-subtle dark:text-feedback-success-strong dark:ring-feedback-success-tint',
				tone === 'danger' &&
					'bg-feedback-error-subtle text-feedback-error-strong shadow-none ring-1 ring-inset ring-feedback-error-tint dark:bg-feedback-error-subtle dark:text-feedback-error-strong dark:ring-feedback-error-tint',
				tone === 'muted' && 'bg-muted shadow-none ring-0',
				interactive && 'hover:shadow-md',
				'has-data-[slot=card-banner]:p-0',
				variant === 'premium' && 'shadow-md',
				variant === 'accent' && 'border border-primary/30 bg-primary/5',
				variant === 'ghost' && 'bg-transparent border-dashed border-2',
				className,
			)}
			{...props}
		/>
	)
}

function CardBanner({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-banner'
			className={cn(
				'relative shrink-0 overflow-hidden bg-muted/30',
				'group-data-[layout=horizontal]/card:w-full group-data-[layout=horizontal]/card:md:h-auto group-data-[layout=horizontal]/card:md:w-[35%] group-data-[layout=horizontal]/card:lg:w-[30%]',
				'group-data-[layout=horizontal]/card:group-data-[side=right]/card:md:order-last',
				className,
			)}
			{...props}
		/>
	)
}

function CardHeader({
	className,
	inset = 'default',
	...props
}: React.ComponentProps<'div'> & { inset?: 'default' | 'compact' }) {
	return (
		<div
			data-slot='card-header'
			data-inset={inset}
			className={cn(
				'gap-2 rounded-t-lg px-6 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
				inset === 'compact' && 'px-0',
				'group-data-[layout=horizontal]/card:md:p-8 group-data-[layout=horizontal]/card:md:pb-0',
				className,
			)}
			{...props}
		/>
	)
}

const cardTitleVariants = cva('', {
	variants: {
		variant: {
			default: 'text-base font-medium',
			// A card that leads somewhere: bold, tight, and it takes the primary on hover.
			strong: 'text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary',
			// The title of a standalone card (sign-in, sign-up).
			display: 'text-3xl font-bold tracking-tight',
		},
	},
	defaultVariants: { variant: 'default' },
})

function CardTitle({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardTitleVariants>) {
	return (
		<div
			data-slot='card-title'
			data-variant={variant}
			className={cn(cardTitleVariants({ variant }), className)}
			{...props}
		/>
	)
}

const cardDescriptionVariants = cva('text-muted-foreground', {
	variants: {
		size: { default: 'text-sm', lg: 'text-base' },
		weight: { default: '', medium: 'font-medium' },
	},
	defaultVariants: { size: 'default', weight: 'default' },
})

function CardDescription({
	className,
	size = 'default',
	weight = 'default',
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardDescriptionVariants>) {
	return (
		<div
			data-slot='card-description'
			className={cn(cardDescriptionVariants({ size, weight }), className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-action'
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	)
}

function CardContent({
	className,
	space = 'default',
	inset = 'default',
	...props
}: React.ComponentProps<'div'> & {
	/** The rhythm between the children: `snug` is a 12px gap (a flex column), `stack` puts 16px between stacked blocks. */
	space?: 'default' | 'snug' | 'stack'
	/** `compact` keeps the responsive card-side inset. */
	inset?: 'default' | 'compact'
}) {
	return (
		<div
			data-slot='card-content'
			data-space={space}
			data-inset={inset}
			className={cn(
				'px-6',
				space === 'snug' && 'flex flex-col gap-2',
				space === 'stack' && 'flex flex-col gap-4',
				inset === 'compact' && 'px-0',
				'group-data-[layout=horizontal]/card:flex-1 group-data-[layout=horizontal]/card:flex group-data-[layout=horizontal]/card:flex-col group-data-[layout=horizontal]/card:md:p-8',
				className,
			)}
			{...props}
		/>
	)
}

function CardFooter({
	className,
	inset = 'default',
	variant = 'default',
	spacing = 'default',
	...props
}: React.ComponentProps<'div'> & {
	inset?: 'default' | 'compact'
	variant?: 'default' | 'summary' | 'status'
	spacing?: 'default' | 'roomy'
}) {
	return (
		<div
			data-slot='card-footer'
			data-inset={inset}
			className={cn(
				'rounded-b-lg px-6 [.border-t]:pt-2 group-data-[size=sm]/card:[.border-t]:pt-4 flex items-center',
				inset === 'compact' && 'px-0',
				variant === 'summary' && 'min-h-10 justify-between gap-3 border-t border-border pt-3',
				variant === 'status' && 'flex-col items-stretch gap-1.5 border-t border-border pt-2',
				variant === 'status' && spacing === 'roomy' && 'pt-3',
				'group-data-[layout=horizontal]/card:md:p-8 group-data-[layout=horizontal]/card:md:pt-0',
				className,
			)}
			{...props}
		/>
	)
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, CardBanner }
