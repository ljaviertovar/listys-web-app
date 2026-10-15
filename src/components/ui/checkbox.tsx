'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '@/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { MinusSignIcon, Tick02Icon } from '@hugeicons/core-free-icons'

const checkboxVariants = cva(
	'peer group/checkbox shrink-0 border ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
	{
		variants: {
			size: {
				default: 'h-4 w-4 rounded-sm border-primary',
				// The 22px touch box of the lists: a white square with a slate border that fills with the primary when ticked.
				lg: 'size-5.5 rounded-md border-slate-400 bg-white dark:bg-transparent',
			},
		},
		defaultVariants: { size: 'default' },
	},
)

function Checkbox({ className, size = 'default', ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
	return (
		<CheckboxPrimitive.Root
			data-slot='checkbox'
			data-size={size}
			className={cn(checkboxVariants({ size }), className)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot='checkbox-indicator'
				className='flex items-center justify-center text-current'
			>
				{/* "Select all" with only some items ticked is `indeterminate`: a dash instead of the tick. */}
				<HugeiconsIcon
					icon={Tick02Icon}
					strokeWidth={2}
					className='h-4 w-4 group-data-[state=indeterminate]/checkbox:hidden'
				/>
				<HugeiconsIcon
					icon={MinusSignIcon}
					strokeWidth={2}
					className='hidden h-4 w-4 group-data-[state=indeterminate]/checkbox:block'
				/>
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
}

export { Checkbox, checkboxVariants }
