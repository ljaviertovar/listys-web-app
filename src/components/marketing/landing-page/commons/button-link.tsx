import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { PRIMARY_BUTTON_LAYER } from '@/components/ui/button'
import { cn } from '@/utils'

/** Marketing links use a flat primary by default; only the hero CTA opts into the shared highlight layer. */
const buttonLinkVariants = cva(
	'inline-flex items-center justify-center gap-[9px] rounded-[10px] border font-semibold focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary [&_svg]:size-[15px]',
	{
		variants: {
			size: {
				sm: 'h-10 md:h-11 rounded-[9px] px-[15px] text-sm',
				lg: 'min-h-11 px-[18px] text-sm',
				xl: 'min-h-[54px] rounded-xl px-[30px] text-base',
			},
			variant: {
				solid: 'border-blue-700/20 bg-primary text-primary-foreground shadow-none transition-[background-color] duration-150 hover:bg-primary/90',
				hero: `relative isolate overflow-hidden border-blue-700/20 bg-primary text-primary-foreground shadow-glow transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:bg-primary/90 hover:shadow-glow-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${PRIMARY_BUTTON_LAYER}`,
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
		'data-testid'?: string
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
