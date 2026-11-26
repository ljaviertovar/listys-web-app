import type { ReactNode } from 'react'

import { cn } from '@/utils'

import { Shell } from './shell'

const SURFACES = {
	/** The page's thermal paper (transparent over the grain). */
	paper: '',
	/** The darker paper of the memory section. */
	sunken: 'bg-paper-sunken',
	/** Clean white paper (the money section and the close). */
	white: 'bg-white',
	/** The dark band. */
	night: 'bg-night text-night-text',
} as const

const RHYTHM = {
	default: 'py-[52px] md:py-[88px] lg:py-32',
	band: 'py-[52px] md:py-[84px] lg:py-30',
	none: '',
} as const

type Props = {
	/** Anchor id used by in-page navigation links. */
	id?: string
	testId: string
	surface?: keyof typeof SURFACES
	rhythm?: keyof typeof RHYTHM
	/** `false` when the section draws its own full-bleed content (the shared-lists photo). */
	contained?: boolean
	/** External layout only (overflow, placement). */
	className?: string
	children: ReactNode
}

/** Owns the surface, anchor and vertical rhythm of a landing section so the section itself stays width-agnostic. */
export function SectionWrapper({
	id,
	testId,
	surface = 'paper',
	rhythm = 'default',
	contained = true,
	className,
	children,
}: Props) {
	return (
		<section
			id={id}
			data-testid={testId}
			className={cn('scroll-mt-16', SURFACES[surface], RHYTHM[rhythm], className)}
		>
			{contained ? <Shell testId={`${testId}-shell`}>{children}</Shell> : children}
		</section>
	)
}
