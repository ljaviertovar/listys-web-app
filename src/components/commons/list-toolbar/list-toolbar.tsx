import type { ReactNode } from 'react'

import { cn } from '@/utils'

interface ListToolbarProps {
	/** How many things the screen lists, with the words that name them. */
	count: number
	unit: { one: string; many: string }
	/** The screen's actions, already styled as buttons. */
	children?: ReactNode
	testId: string
	className?: string
}

/** The row under a screen title: the mono count on the left and the screen's actions on the right. */
export function ListToolbar({ count, unit, children, testId, className }: ListToolbarProps) {
	return (
		<div
			data-testid={testId}
			className={cn('flex min-h-11 flex-wrap items-center justify-between gap-2', className)}
		>
			<span className='text-[13px] leading-[1.3] text-slate-500 dark:text-muted-foreground'>
				<b className='font-mono font-semibold text-foreground tabular-nums'>{count}</b> {count === 1 ? unit.one : unit.many}
			</span>
			{children ? <div className='flex items-center gap-2'>{children}</div> : null}
		</div>
	)
}
