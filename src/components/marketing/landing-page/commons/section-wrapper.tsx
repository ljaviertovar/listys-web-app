import type { ReactNode } from 'react'

import { cn } from '@/utils'

import { Shell } from './shell'

type Props = {
	/** Anchor id used by in-page navigation links. */
	id?: string
	testId: string
	/** `contained` centers the section in the landing max-width; `full` leaves the width to the section. */
	width?: 'contained' | 'full'
	/** Band styling for the section: background, overflow, padding overrides. */
	className?: string
	children: ReactNode
}

/** Owns the width, anchor and vertical rhythm of a landing section so the section itself stays width-agnostic. */
export function SectionWrapper({ id, testId, width = 'contained', className, children }: Props) {
	if (width === 'full') {
		return (
			<div
				id={id}
				data-testid={testId}
				className={cn('relative w-full', className)}
			>
				{children}
			</div>
		)
	}

	return (
		<section
			id={id}
			data-testid={testId}
			className={cn('section-divider scroll-mt-16 py-[72px] min-[900px]:py-[104px]', className)}
		>
			<Shell testId={`${testId}-shell`}>{children}</Shell>
		</section>
	)
}
