import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const textareaVariants = cva(
	'flex w-full resize-none rounded-2xl border border-transparent bg-input/50 p-3 text-base shadow-xs transition-[color,box-shadow] placeholder:text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			size: {
				default: 'min-h-16',
				compact: 'h-14 min-h-14 overflow-y-auto text-base leading-5 md:text-sm',
			},
		},
		defaultVariants: { size: 'default' },
	},
)

function Textarea({ className, size = 'default', ...props }: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
	return (
		<textarea
			data-slot='textarea'
			data-size={size}
			className={cn(textareaVariants({ size }), className)}
			{...props}
		/>
	)
}

export { Textarea, textareaVariants }
