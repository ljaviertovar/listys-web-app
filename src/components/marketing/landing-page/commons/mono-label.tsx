import type { ReactNode } from 'react'

import { cn } from '@/utils'

const TONES = {
	muted: 'text-paper-muted',
	ink: 'text-paper-ink',
	accent: 'text-primary',
	scan: 'text-scan-strong',
	'on-dark': 'text-night-text',
	'on-dark-muted': 'text-night-muted',
	// Over a photo; the second only from `md`, where the shared-lists phones still overlap the photo.
	'on-photo': 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]',
	'on-photo-from-md': 'text-paper-muted md:text-white md:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]',
	// On the blue stamps.
	'on-accent': 'text-primary-foreground/85',
} as const

const SIZES = {
	default: 'text-xs tracking-[0.12em]',
	sm: 'text-[11px] tracking-[0.1em]',
	xs: 'text-[10px] tracking-[0.1em]',
} as const

type MonoLabelProps = {
	children: ReactNode
	tone?: keyof typeof TONES
	/** `sm` is the 11px label of the phone layout; `xs` the 10px caption of a stamp. */
	size?: keyof typeof SIZES
	as?: 'span' | 'p'
	testId?: string
	/** External layout only (margins, placement). */
	className?: string
}

/** The receipt's printed voice: every section number, column head and figure caption on the landing is set in it. */
export function MonoLabel({ children, tone = 'muted', size = 'default', as: Tag = 'span', testId, className }: MonoLabelProps) {
	return (
		<Tag
			data-testid={testId}
			className={cn(
				'font-mono font-medium uppercase',
				SIZES[size],
				TONES[tone],
				className,
			)}
		>
			{children}
		</Tag>
	)
}
