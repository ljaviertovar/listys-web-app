import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/utils'

/** The landing CTA carries the same restrained blue highlight as the app's primary button. */
const buttonLinkVariants = cva(
	"relative isolate inline-flex items-center justify-center gap-[9px] overflow-hidden rounded-[10px] border border-blue-700/20 bg-gradient-to-b from-blue-500 to-primary font-bold text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.7)] transition-[background-color,box-shadow,transform] duration-150 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-80 before:content-[''] hover:-translate-y-px hover:from-blue-500 hover:to-blue-700 hover:shadow-[0_13px_25px_-12px_rgba(37,99,235,0.72)] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary [&_svg]:size-[15px]",
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

type ButtonLinkProps = ComponentProps<typeof Link> &
	VariantProps<typeof buttonLinkVariants> & {
		testId?: string
	}

export function ButtonLink({ size, variant, className, testId, 'data-testid': dataTestId, ...props }: ButtonLinkProps) {
	return (
		<Link
			className={cn(buttonLinkVariants({ size, variant }), className)}
			data-testid={testId ?? dataTestId ?? 'landing-button-link'}
			{...props}
		/>
	)
}
