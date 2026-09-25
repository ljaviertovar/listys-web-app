import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/utils'

/**
 * The landing page's flat CTA style (lift + shadow on hover) is a deliberately different
 * treatment from the app-wide shadcn Button (gradient overlay), so it stays a small
 * dedicated component instead of overriding that primitive.
 */
const buttonLinkVariants = cva(
	'inline-flex items-center justify-center gap-[9px] rounded-[10px] bg-primary font-bold text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.7)] transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-blue-700 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary [&_svg]:size-[15px]',
	{
		variants: {
			size: {
				sm: 'min-h-10 max-sm:min-h-11 rounded-[9px] px-[15px] text-[13.5px]',
				lg: 'min-h-11 px-[18px] text-sm',
				xl: 'min-h-[54px] rounded-xl px-[30px] text-[17px] shadow-[0_18px_34px_-16px_rgba(37,99,235,0.75)]',
			},
			variant: {
				solid: '',
				ghost: 'border border-slate-300 bg-white text-slate-900 shadow-none hover:border-slate-500 hover:bg-slate-100',
			},
		},
		defaultVariants: {
			size: 'lg',
			variant: 'solid',
		},
	},
)

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonLinkVariants>

export function ButtonLink({ size, variant, className, ...props }: ButtonLinkProps) {
	return (
		<Link
			className={cn(buttonLinkVariants({ size, variant }), className)}
			{...props}
		/>
	)
}
