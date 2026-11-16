import type { ReactNode } from 'react'

import { CardFooter } from '@/components/ui/card'
import { cn } from '@/utils'

/**
 * The shared parts of the object card (canvas C1: a list, a store, a receipt, a trip). Each kind fills the same slots and none restyles
 * them, so the title, the rows and the footer sit at the same height on every card. The card itself is `<Card size='object'>`.
 */

/** Slots 1 and 2: the title and its aside (a status chip or the "⋯" menu), in a 32px row. The title is one line with an ellipsis. */
export function ObjectCardTitleRow({ title, aside, className }: { title: ReactNode; aside?: ReactNode; className?: string }) {
	return (
		<div className={cn('flex min-h-8 min-w-0 items-center gap-3', className)}>
			<h2 className='min-w-0 flex-1 truncate font-display text-base leading-6 font-semibold tracking-tight'>{title}</h2>
			{aside ? <div className='shrink-0'>{aside}</div> : null}
		</div>
	)
}

/** The blocks under the title (note, chips, amount and data line), 8px apart. An empty block is left out by its card. */
export function ObjectCardBody({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={cn('flex flex-col gap-2', className)}>{children}</div>
}

/** Slot 4: the classification row. 12px across and 8px down, because an entity label has no box and needs the air. */
export function ObjectCardChips({ children, className, testId }: { children: ReactNode; className?: string; testId?: string }) {
	return (
		<div data-testid={testId} className={cn('flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2', className)}>
			{children}
		</div>
	)
}

/** Slot 5 with slot 6: the amount a card is scanned for and its data line, one figure and its context (4px apart). */
export function ObjectCardFigure({ children, className, testId }: { children: ReactNode; className?: string; testId?: string }) {
	return (
		<div data-testid={testId} className={cn('flex flex-col gap-1', className)}>
			{children}
		</div>
	)
}

/** Slots 7 and 8: a hairline, 12px of air above it, and a footer at least 40px tall. */
export function ObjectCardFooter({ children, className, variant = 'summary', spacing = 'default' }: {
	children: ReactNode
	className?: string
	variant?: 'summary' | 'status'
	spacing?: 'default' | 'roomy'
}) {
	return (
		<CardFooter variant={variant} inset='compact' spacing={spacing} className={cn('mt-3', className)}>
			{children}
		</CardFooter>
	)
}

/** The link at the end of the footer: its arrow ends on the card's content edge, like the menu and the status chip. */
export const OBJECT_CARD_LINK = 'shrink-0 -mr-3'
