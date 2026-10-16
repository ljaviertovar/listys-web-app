import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { ViewAllLink } from './view-all-link'

interface Props {
	testId: string
	title: string
	viewAll: { href: string; noun: string; testId: string }
	children: ReactNode
}

/**
 * Shared shell of the three dashboard sections (design A1): the title and its "View all" link sit above a white card
 * that holds the rows. Cards stretch to the tallest sibling so a row of sections stays level. Only the links react to hover: the card body is not clickable.
 */
export function DashboardSectionCard({ testId, title, viewAll, children }: Props) {
	return (
		<section
			data-testid={testId}
			aria-labelledby={`${testId}-title`}
			className='flex h-full min-w-0 flex-col gap-3'
		>
			<div className='flex items-center gap-3'>
				<h2
					id={`${testId}-title`}
					className='min-w-0 flex-1 font-display text-base leading-normal font-semibold md:text-xl md:leading-[1.39] '
				>
					{title}
				</h2>
				<ViewAllLink {...viewAll} />
			</div>
			<Card
				size='tight'
				className='flex-1'
			>
				{children}
			</Card>
		</section>
	)
}
