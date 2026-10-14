import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { cn } from '@/utils'

interface EmptyStateCardProps {
	icon: IconSvgElement
	/** `blue` is the neutral first-use state; `amber` a notice that something is missing. */
	tone?: 'blue' | 'amber'
	title: string
	description: ReactNode
	/** The one action that fills the screen, as a primary button. */
	children?: ReactNode
	testId: string
}

const TONES = {
	blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
	amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
} as const

/** A screen with nothing on it yet: one centred card with an icon tile, what is missing and the single action that fixes it. */
export function EmptyStateCard({ icon, tone = 'blue', title, description, children, testId }: EmptyStateCardProps) {
	return (
		<section
			data-testid={testId}
			className='flex flex-col items-center gap-4 px-5 py-8 text-center rounded-3xl bg-card shadow-card'
		>
			<span className={cn('flex size-14 items-center justify-center rounded-2xl', TONES[tone])}>
				<HugeiconsIcon
					icon={icon}
					strokeWidth={1.5}
					aria-hidden='true'
					className='size-6'
				/>
			</span>
			<div className='flex max-w-sm flex-col gap-1.5'>
				<h2 className='font-display text-lg leading-[1.3] font-semibold '>{title}</h2>
				<p className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>{description}</p>
			</div>
			{children}
		</section>
	)
}
