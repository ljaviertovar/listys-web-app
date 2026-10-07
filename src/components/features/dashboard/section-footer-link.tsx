import Link from 'next/link'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/utils'
import { FOCUS_RING } from './helpers/dashboard-styles'

interface Props {
	href: string
	children: string
	testId: string
}

/** The "View all …" link that closes every dashboard section card. */
export function SectionFooterLink({ href, children, testId }: Props) {
	return (
		<Link
			href={href}
			data-testid={testId}
			className={cn(
				'inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-semibold text-primary hover:underline',
				FOCUS_RING,
			)}
		>
			{children}
			<HugeiconsIcon
				icon={ArrowRight01Icon}
				strokeWidth={2}
				className='size-4'
			/>
		</Link>
	)
}
