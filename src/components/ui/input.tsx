import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const inputVariants = cva(
	'flex w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 text-base shadow-xs transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			variant: {
				default: '',
				amount: 'text-right font-mono font-semibold tabular-nums',
			},
			size: {
				default: 'h-11 md:h-9',
				lg: 'h-11 px-3.5',
			},
			// Room for a 44px control laid over the end of the field (the show-password toggle).
			adornment: {
				none: '',
				start: 'pl-11',
				end: 'pr-13',
			},
		},
		defaultVariants: { size: 'default', adornment: 'none' },
	},
)

function Input({
	className,
	type,
	size = 'default',
	adornment = 'none',
	variant = 'default',
	...props
}: Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
	return (
		<input
			type={type}
			data-slot='input'
			data-size={size}
			className={cn(inputVariants({ size, adornment, variant }), className)}
			{...props}
		/>
	)
}

export { Input, inputVariants }
