'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '@/utils'

const progressVariants = cva('relative flex w-full items-center overflow-x-hidden rounded-4xl', {
	variants: {
		size: { default: 'h-3', md: 'h-2', sm: 'h-1.5' },
		tone: {
			default: 'bg-muted',
			// The sidebar's session card: a pale blue track.
			soft: 'bg-blue-100 dark:bg-primary/20',
			// A card's own progress: the hairline-grey track.
			track: 'bg-border dark:bg-muted',
			// Over ink or photo surfaces (the dashboard hero): a translucent track and a blue gradient fill.
			'on-dark': 'bg-white/15',
		},
	},
	defaultVariants: { size: 'default', tone: 'default' },
})

function Progress({
	className,
	value,
	size = 'default',
	tone = 'default',
	complete = false,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
	VariantProps<typeof progressVariants> & {
		/** The task is done: the fill turns green. */
		complete?: boolean
	}) {
	return (
		<ProgressPrimitive.Root
			data-slot='progress'
			value={value}
			data-size={size}
			data-tone={tone}
			className={cn(progressVariants({ size, tone }), className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot='progress-indicator'
				className={cn('size-full flex-1 transition-transform motion-reduce:transition-none', tone === 'on-dark' ? 'bg-linear-to-r from-blue-400 to-blue-500' : complete ? 'bg-green-500' : 'bg-primary')}
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</ProgressPrimitive.Root>
	)
}

export { Progress, progressVariants }
