'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '@/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { MinusSignIcon, Tick02Icon } from '@hugeicons/core-free-icons'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot='checkbox'
			className={cn(
				'peer group/checkbox h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
				className,
			)}
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

export { Checkbox }
