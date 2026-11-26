import type { ReactNode } from 'react'

import { cn } from '@/utils'

const PADDING = {
	ticket: 'px-3.5 pt-3.5 pb-8 md:pb-10',
	sheet: 'px-4 pt-4 pb-8 md:px-[clamp(18px,3vw,34px)] md:pt-[26px] md:pb-[46px]',
	receipt: 'px-[18px] pt-5 pb-[34px]',
	empty: 'px-4 pt-[18px] pb-[34px]',
} as const

const SURFACES = {
	/** White receipt paper that looks the same in both themes (the landing). */
	paper: 'bg-white',
	/** The app's card, which follows the theme. */
	card: 'bg-card dark:bg-muted',
} as const

type TornPaperProps = {
	children: ReactNode
	/** The inner padding: a how-it-works ticket, the FAQ sheet, the hero receipt or an empty state. */
	padding?: keyof typeof PADDING
	surface?: keyof typeof SURFACES
	/** Lifts and tilts the ticket a little on hover (the how-it-works tickets). */
	lift?: boolean
	testId: string
	/** External layout only (width, margins, placement). */
	className?: string
}

/** A slip of receipt paper with a torn bottom edge and the soft shadow it casts on the page. */
export function TornPaper({ children, padding = 'ticket', surface = 'paper', lift = false, testId, className }: TornPaperProps) {
	return (
		<div
			data-testid={testId}
			className={cn(
				'drop-shadow-xl',
				lift &&
					'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:-rotate-[0.4deg] motion-reduce:transition-none motion-reduce:hover:transform-none',
				className,
			)}
		>
			<div className={cn('receipt-torn rounded-t-[14px]', SURFACES[surface], PADDING[padding])}>{children}</div>
		</div>
	)
}
