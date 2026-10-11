import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/utils'
import { CARD_SURFACE } from './helpers/dashboard-styles'
import { ViewAllLink } from './view-all-link'

interface Props {
	testId: string
	title: string
	viewAll: { href: string; noun: string; testId: string }
	children: ReactNode
}

/**
 * Shared shell of the three dashboard sections (design A1): the title and its "View all" link sit above a white card
 * that holds the rows. Cards stretch to the tallest sibling so a row of sections stays level, and lift a little on hover.
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
					className='min-w-0 flex-1 font-display text-base leading-normal font-semibold tracking-[-0.005em] md:text-xl md:leading-[1.39] md:tracking-[-0.01em]'
				>
					{title}
				</h2>
				<ViewAllLink {...viewAll} />
			</div>
			<Card
				className={cn(
					'flex-1 gap-0 p-2.5 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-12px_rgba(15,23,42,0.18)]',
					CARD_SURFACE,
				)}
			>
				{children}
			</Card>
		</section>
	)
}
