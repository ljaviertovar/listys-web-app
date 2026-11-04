import type { ReactNode } from 'react'

import { cn } from '@/utils'

import { InlineCounter } from '../inline-counter/inline-counter'

interface ListToolbarProps {
	/** How many things the screen lists, with the words that name them. */
	count: number
	unit: { one: string; many: string }
	/** The screen's actions, already styled as buttons. */
	children?: ReactNode
	testId: string
	className?: string
}

/** The row under a screen title: the inline counter on the left and the screen's actions on the right. */
export function ListToolbar({ count, unit, children, testId, className }: ListToolbarProps) {
	return (
		<div
			data-testid={testId}
			className={cn('flex min-h-11 flex-wrap items-center justify-between gap-2', className)}
		>
			<InlineCounter
				count={count}
				one={unit.one}
				many={unit.many}
				testId={`${testId}-count`}
			/>
			{children ? <div className='flex items-center gap-2'>{children}</div> : null}
		</div>
	)
}
