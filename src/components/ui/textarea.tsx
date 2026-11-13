import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const textareaVariants = cva(
	'flex w-full resize-none rounded-2xl border-0 bg-card px-3.5 text-base shadow-field placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			size: {
				default: 'min-h-14 py-2.5',
				compact: 'h-14 min-h-14 overflow-y-auto py-2 text-sm leading-5',
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
