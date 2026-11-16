import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

type ActionLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
	children: ReactNode
	testId?: string
	className?: string
	/** Makes the whole nearest positioned ancestor (an object card) the tap target; its own menu and buttons sit above it with `relative z-10`. */
	stretched?: boolean
}

/** The "View Details" / "View All" link that ends a row or titles a section: an arrow that nudges on hover. */
export function ActionLink({ children, testId, className, stretched = false, ...linkProps }: ActionLinkProps) {
	return (
		<Button
			asChild
			variant='ghost'
			size='default'
			className={cn(stretched && 'after:absolute after:inset-0 after:content-[""]', className)}
		>
			<Link
				data-testid={testId}
				{...linkProps}
			>
				{children}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					strokeWidth={2}
					aria-hidden='true'
					className='size-4'
				/>
			</Link>
		</Button>
	)
}
