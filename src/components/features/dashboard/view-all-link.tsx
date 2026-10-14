import Link from 'next/link'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

interface Props {
	href: string
	/** What "all" refers to ("groups"); only read aloud, so each link has its own accessible name. */
	noun: string
	testId: string
}

/** The "View all" link at the right of every section title: compact on phones, 40px from tablet width. */
export function ViewAllLink({ href, noun, testId }: Props) {
	return (
		<Button
			asChild
			variant='ghost-primary'
			size='sm'
			className='shrink-0'
		>
			<Link
				href={href}
				data-testid={testId}
			>
				<span>
					View All<span className='sr-only'> {noun}</span>
				</span>
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					strokeWidth={2}
					className='size-4'
				/>
			</Link>
		</Button>
	)
}
