'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '@/utils'

const progressVariants = cva('relative flex w-full items-center overflow-x-hidden rounded-4xl', {
	variants: {
		size: { default: 'h-3', md: 'h-2', sm: 'h-1.5' },
		shape: { default: '', square: 'rounded-none' },
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
	defaultVariants: { size: 'default', shape: 'default', tone: 'default' },
})

function Progress({
	className,
	value,
	size = 'default',
	shape = 'default',
	tone = 'default',
	complete = false,
	indeterminate = false,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
	VariantProps<typeof progressVariants> & {
		/** The task is done: the fill turns green. */
		complete?: boolean
		/** The amount is not known (a receipt being read): a short pulsing fill instead of a measured one. */
		indeterminate?: boolean
	}) {
	return (
		<ProgressPrimitive.Root
			data-slot='progress'
			value={value}
			data-size={size}
			data-tone={tone}
		className={cn(progressVariants({ size, shape, tone }), className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot='progress-indicator'
				className={cn(
					'size-full flex-1 transition-transform motion-reduce:transition-none',
					tone === 'on-dark' ? 'bg-linear-to-r from-blue-400 to-blue-500' : complete ? 'bg-green-500' : 'bg-primary',
					indeterminate && 'w-2/5 flex-none animate-pulse rounded-full motion-reduce:animate-none',
				)}
				style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</ProgressPrimitive.Root>
	)
}

const RING_RADIUS = 34
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/**
 * A measured progress as a ring: the arc grows clockwise from 12 o'clock over a hairline track, and the percentage sits in the middle
 * in mono. Blue while it is running, green once it is `complete`. It is a progressbar, so the visible percentage is hidden from
 * assistive tech and `label` names what is measured. Reduced-motion users get the final arc without the transition.
 */
function ProgressRing({
	className,
	value = 0,
	size = 80,
	complete = false,
	label,
	...props
}: Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, 'children' | 'aria-label'> & {
	/** What is being measured, read by assistive tech ("Items collected in this shopping session"). */
	label: string
	/** The outer size in px; the drawing scales with it. */
	size?: number
	/** The task is done: the arc and the percentage turn green. */
	complete?: boolean
}) {
	const percent = Math.min(100, Math.max(0, value ?? 0))
	const arc = (percent / 100) * RING_CIRCUMFERENCE

	return (
		<ProgressPrimitive.Root
			data-slot='progress-ring'
			value={percent}
			aria-label={label}
			className={cn('relative shrink-0', className)}
			style={{ width: size, height: size }}
			{...props}
		>
			<svg viewBox='0 0 80 80' width={size} height={size} aria-hidden='true' className='block'>
				<circle cx='40' cy='40' r={RING_RADIUS} fill='none' strokeWidth='8' className='stroke-border' />
				{percent > 0 ? (
					<circle
						cx='40'
						cy='40'
						r={RING_RADIUS}
						fill='none'
						strokeWidth='8'
						strokeLinecap='round'
						strokeDasharray={`${arc} ${RING_CIRCUMFERENCE}`}
						transform='rotate(-90 40 40)'
						className={cn('transition-[stroke-dasharray] duration-300 motion-reduce:transition-none', complete ? 'stroke-green-500' : 'stroke-primary dark:stroke-blue-400')}
					/>
				) : null}
			</svg>
			<span
				aria-hidden='true'
				className={cn(
					'absolute inset-0 flex items-center justify-center font-mono leading-6 font-semibold tracking-tight tabular-nums',
					percent === 100 ? 'text-lg' : 'text-xl',
					complete ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-300',
				)}
			>
				{percent}<span className='ml-px text-xs font-medium tracking-normal'>%</span>
			</span>
		</ProgressPrimitive.Root>
	)
}

export { Progress, ProgressRing, progressVariants }
