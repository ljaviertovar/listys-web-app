import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

/** Borderless field on the card surface with a hairline ring (`shadow-field`); the invalid state swaps the ring for a red one. */
const inputVariants = cva(
	'flex w-full min-w-0 border-0 bg-card shadow-field transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				default: 'h-9 rounded-xl px-3 py-1 text-sm',
				// Touch height of the app's forms (44px).
				lg: 'h-11 rounded-2xl px-3.5 text-base md:text-sm',
			},
			// Room for a 44px control laid over the end of the field (the show-password toggle).
			adornment: {
				none: '',
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
	...props
}: Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
	return (
		<input
			type={type}
			data-slot='input'
			data-size={size}
			className={cn(inputVariants({ size, adornment }), className)}
			{...props}
		/>
	)
}

export { Input, inputVariants }
