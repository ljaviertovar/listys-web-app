import type { ReactNode } from 'react'

interface Props {
	message: string
	/** The one next step for this section, when there is one (History has none). */
	action?: ReactNode
	testId: string
}

/**
 * Empty body of a section card. The block has the same height in every card, whether or not it carries an action, and
 * is centred on both axes, so the three cards stay level and their footers line up.
 */
export function DashboardEmptyState({ message, action, testId }: Props) {
	return (
		<div
			data-testid={testId}
			className='flex flex-1 items-center justify-center'
		>
			<div className='flex h-[172px] w-full max-w-[280px] flex-col items-center justify-center gap-3 text-center md:h-[150px]'>
				<p className='text-[13px] leading-[1.55] text-muted-foreground'>{message}</p>
				{action}
			</div>
		</div>
	)
}
