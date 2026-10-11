import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { RowIcon } from './row-icon'

interface Props {
	testId: string
	icon: IconSvgElement
	tone: 'primary' | 'ocr' | 'success'
	/** First sentence, set on its own line ("No groups yet."). */
	title: string
	message: string
	/** The one next step for this section, when there is one (History has none). */
	action?: ReactNode
}

/**
 * Empty body of a section card (design A1): a tinted icon, a two-line explanation and, when there is one, the primary
 * button of the section. The block keeps the same minimum height in every card, so the three stay level.
 */
export function DashboardEmptyState({ testId, icon, tone, title, message, action }: Props) {
	return (
		<div
			data-testid={testId}
			className='flex flex-1 items-center justify-center'
		>
			<div className='flex min-h-[172px] w-full flex-col items-center justify-center pt-5 pb-2 text-center'>
				<RowIcon
					icon={icon}
					tone={tone}
					size='xl'
					emphasis='medium'
					className='mb-2'
				/>
				<p className='max-w-[280px] p-2 text-[13.5px] leading-[1.55] text-slate-500 dark:text-muted-foreground'>
					{title}
					<br />
					{message}
				</p>
				{action ? <div className='flex justify-center px-2 pt-1 pb-2'>{action}</div> : null}
			</div>
		</div>
	)
}
