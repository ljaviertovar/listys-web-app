import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { ViewAllLink } from './view-all-link'

interface Props {
	testId: string
	title: string
	viewAll: { href: string; noun: string; testId: string }
	children: ReactNode
	cardSize?: 'dashboard' | 'dashboard-compact'
}

/**
 * Shared shell of dashboard sections: each white card contains its title, "View all" link, and rows.
 */
export function DashboardSectionCard({ testId, title, viewAll, children, cardSize = 'dashboard' }: Props) {
	return (
		<section
			data-testid={testId}
			aria-labelledby={`${testId}-title`}
			className='flex h-full min-w-0 flex-col'
		>
			<Card
				size={cardSize}
				className='flex-1'
			>
				<div className='flex min-h-10 items-center gap-3 px-2'>
					<h2
						id={`${testId}-title`}
						className='min-w-0 flex-1 font-display text-base leading-normal font-semibold md:text-xl md:leading-[1.39]'
					>
						{title}
					</h2>
					<ViewAllLink {...viewAll} />
				</div>
				{children}
			</Card>
		</section>
	)
}
