import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { Card, CardDescription } from '@/components/ui/card'
import { cn } from '@/utils'

const TONES = {
	primary: 'bg-blue-50 text-primary dark:bg-primary/10',
	ocr: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
	success: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
} as const

interface Props {
	testId: string
	icon: IconSvgElement
	tone: keyof typeof TONES
	title: string
	description: string
	count: number
	countLabel: string
	/** The "View all …" link; it is right-aligned in the footer. */
	footer: ReactNode
	children: ReactNode
}

/**
 * Shared shell of the three dashboard sections (A1): a soft slate-200 hairline and a two-layer ink shadow (the `card`
 * shadow of DESIGN.md) that deepen slightly while the border turns blue-200 on hover, 20px radius on phones and 24px
 * from `md`, and slate-100 dividers inset by the card padding. Cards stretch to the tallest sibling and the footer is
 * pinned to the bottom so the "View all" links line up however much each card previews.
 */
export function DashboardSectionCard({
	testId,
	icon,
	tone,
	title,
	description,
	count,
	countLabel,
	footer,
	children,
}: Props) {
	return (
		<Card
			data-testid={testId}
			className='h-full gap-4 rounded-[20px] border-slate-200/70 p-4.5 shadow-card transition-shadow duration-200 hover:shadow-card-hover md:rounded-3xl md:p-5 dark:border-border dark:shadow-none'
		>
			<div className='flex items-center gap-4 md:items-start'>
				<span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', TONES[tone])}>
					<HugeiconsIcon
						icon={icon}
						strokeWidth={1.5}
						className='size-6'
					/>
				</span>
				<div className='flex min-w-0 flex-1 flex-col gap-1'>
					<h2 className='font-display text-base font-[650] leading-[1.3]'>{title}</h2>
					{/* Phones skip the explanation once the card has rows: the title and the rows already say what it is. An empty card keeps it. */}
					<CardDescription className={cn('text-[13px] leading-[1.55]', count > 0 && 'max-md:hidden')}>{description}</CardDescription>
				</div>
				<div className='flex flex-col items-end gap-1'>
					<span className='font-display text-2xl font-bold leading-none tabular-nums'>{count}</span>
					<span className='text-xs text-muted-foreground'>{countLabel}</span>
				</div>
			</div>
			{/* Phones preview two rows per card to keep the page short; "View all" holds the rest. */}
			<div className='flex flex-1 flex-col gap-1 border-t border-slate-100 pt-2.5 max-md:[&>*:nth-child(n+3)]:hidden dark:border-border'>
				{children}
			</div>
			<div className='flex min-h-12 items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-border'>
				{footer}
			</div>
		</Card>
	)
}
