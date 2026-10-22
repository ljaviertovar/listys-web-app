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
	...props
}: React.ComponentProps<'div'> & {
	/** `compact`, `tight` and `flush` drop the gap between the parts of the card and shrink its padding (a card of list rows). */
	size?: 'default' | 'sm' | 'compact' | 'tight' | 'flush'
	variant?: 'default' | 'premium' | 'accent' | 'ghost'
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
			className={cn(
				'group/card flex flex-col overflow-hidden rounded-3xl border-0 bg-card text-sm text-card-foreground shadow-card transition-shadow duration-300 motion-reduce:transition-none dark:border dark:shadow-none',
				layout === 'default' && 'gap-6 py-3 md:py-4',
				layout === 'horizontal' && 'p-0 gap-0 md:flex-row',
				size === 'compact' && 'gap-0 py-3 md:py-4',
				size === 'tight' && 'gap-0 p-3 md:p-4',
				size === 'flush' && 'gap-0 p-3 md:p-4',
				interactive && 'hover:shadow-card-hover',
				'has-data-[slot=card-banner]:p-0',
				variant === 'premium' &&
					'border border-muted-foreground/10 shadow-premium ring-1 ring-slate-200/60 hover:shadow-xl hover:shadow-primary/5 dark:ring-slate-800/60',
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

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-header'
			className={cn(
				'gap-2 rounded-t-lg px-3 md:px-4 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
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

function CardTitle({ className, variant = 'default', ...props }: React.ComponentProps<'div'> & VariantProps<typeof cardTitleVariants>) {
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

function CardDescription({ className, size = 'default', weight = 'default', ...props }: React.ComponentProps<'div'> & VariantProps<typeof cardDescriptionVariants>) {
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
				'px-3 md:px-4',
				space === 'snug' && 'gap-3',
				space === 'stack' && 'space-y-4',
				inset === 'compact' && 'px-3 md:px-4',
				'group-data-[layout=horizontal]/card:flex-1 group-data-[layout=horizontal]/card:flex group-data-[layout=horizontal]/card:flex-col group-data-[layout=horizontal]/card:md:p-8',
				className,
			)}
			{...props}
		/>
	)
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-footer'
			className={cn(
				'rounded-b-lg px-3 md:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4 flex items-center',
				'group-data-[layout=horizontal]/card:md:p-8 group-data-[layout=horizontal]/card:md:pt-0',
				className,
			)}
			{...props}
		/>
	)
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, CardBanner }
