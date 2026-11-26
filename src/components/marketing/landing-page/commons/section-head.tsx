import type { ReactNode } from 'react'

import { cn } from '@/utils'

import { MonoLabel } from './mono-label'

type SectionHeadProps = {
	/** "01 — What it adds up to". */
	number: string
	title: ReactNode
	description: ReactNode
	/** `row` lays number, title and text across the width on desktop; `stack` keeps them in one column (a sticky side column). */
	layout?: 'row' | 'stack'
	/** The display size of the title: `lg` for the side columns, `default` for full-width heads. */
	titleSize?: 'default' | 'lg' | 'faq'
	testId: string
}

const TITLE_SIZES = {
	default: 'text-[clamp(36px,4.8vw,64px)] leading-[0.96]',
	lg: 'max-w-[12ch] text-[clamp(38px,5.2vw,72px)] leading-[0.94] tracking-[-0.05em]',
	faq: 'max-w-[9ch] text-[clamp(36px,4.6vw,60px)] leading-[0.96]',
} as const

/** A landing section's printed head: its number on a rule, the display title and one paragraph. */
export function SectionHead({ number, title, description, layout = 'row', titleSize = 'default', testId }: SectionHeadProps) {
	const heading = (
		<h2 className={cn('font-extrabold tracking-[-0.045em] text-paper-ink', TITLE_SIZES[titleSize])}>{title}</h2>
	)

	if (layout === 'stack') {
		return (
			<div data-testid={testId}>
				<MonoLabel>{number}</MonoLabel>
				<div className='mt-[18px]'>{heading}</div>
				<p className='mt-6 max-w-[28em] text-lg leading-relaxed'>{description}</p>
			</div>
		)
	}

	return (
		<div
			data-testid={testId}
			className='mb-11 grid gap-[18px] md:mb-14 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,0.75fr)] lg:items-end lg:gap-8'
		>
			<MonoLabel className='self-start border-t-[1.5px] border-paper-ink pt-3'>{number}</MonoLabel>
			{heading}
			<p className='max-w-[30em] text-base leading-relaxed md:text-[17.5px]'>{description}</p>
		</div>
	)
}
