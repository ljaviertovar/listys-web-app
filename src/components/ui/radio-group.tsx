'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/utils'

function RadioGroup({ className, spacing = 'default', ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root> & { spacing?: 'default' | 'snug' }) {
	return (
		<RadioGroupPrimitive.Root
			data-slot='radio-group'
			className={cn('grid', spacing === 'snug' ? 'gap-2' : 'gap-3', className)}
			{...props}
		/>
	)
}

function RadioGroupItem({ className, size = 'default', ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { size?: 'default' | 'card' | 'ring' }) {
	return (
		<RadioGroupPrimitive.Item
			data-slot='radio-group-item'
			className={cn(
				'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
				size === 'card' && 'size-5 border-2 shadow-none data-[state=checked]:border-primary',
				// The canvas v4 choice radio: a hollow 20px circle that fills its 6px border with the primary when chosen.
				size === 'ring' && 'size-5 border-[1.5px] border-slate-300 bg-card shadow-none data-[state=checked]:border-[6px] data-[state=checked]:border-primary',
				className
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot='radio-group-indicator'
				className={cn('relative flex items-center justify-center', size === 'ring' && 'hidden')}
			>
				<CircleIcon className='fill-primary size-2' />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	)
}

export { RadioGroup, RadioGroupItem }
