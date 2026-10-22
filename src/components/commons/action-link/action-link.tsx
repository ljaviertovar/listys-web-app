import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

type ActionLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
	children: ReactNode
	testId?: string
	className?: string
}

/** The "View Details" / "View All" link that ends a row or titles a section: blue label and an arrow that nudges on hover. */
export function ActionLink({ children, testId, className, ...linkProps }: ActionLinkProps) {
	return (
		<Button
			asChild
			variant='ghost-primary'
			size='link-inline'
			rounded='lg'
			className={className}
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
