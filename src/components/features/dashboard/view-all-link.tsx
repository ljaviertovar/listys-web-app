import Link from 'next/link'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/utils'
import { FOCUS_RING } from './helpers/dashboard-styles'

interface Props {
	href: string
	/** What "all" refers to ("groups"); only read aloud, so each link has its own accessible name. */
	noun: string
	testId: string
}

/** The "View all" link at the right of every section title: compact on phones, 40px from tablet width. */
export function ViewAllLink({ href, noun, testId }: Props) {
	return (
		<Link
			href={href}
			data-testid={testId}
			className={cn(
				'inline-flex min-h-8 shrink-0 items-center gap-1 rounded-[12px] pr-2 pl-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-[#E9ECF0] md:min-h-10 md:pr-2.5 md:pl-3 md:text-sm dark:text-blue-400 dark:hover:bg-muted',
				FOCUS_RING,
			)}
		>
			<span>
				View all<span className='sr-only'> {noun}</span>
			</span>
			<HugeiconsIcon
				icon={ArrowRight01Icon}
				strokeWidth={2}
				className='size-4'
			/>
		</Link>
	)
}
