import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { cn } from '@/utils'

const TONES = {
	neutral: { medium: 'bg-secondary text-body dark:bg-muted dark:text-body' },
	primary: {
		medium: 'bg-entity-list text-entity-list-on dark:bg-entity-list dark:text-entity-list-on',
	},
	ocr: {
		medium: 'bg-entity-receipt text-entity-receipt-on dark:bg-entity-receipt dark:text-entity-receipt-on',
	},
	success: {
		medium: 'bg-entity-trip text-entity-trip-on dark:bg-entity-trip dark:text-entity-trip-on',
	},
	warning: {
		medium: 'bg-feedback-warning-tint text-feedback-warning dark:bg-feedback-warning-tint dark:text-feedback-warning',
	},
	danger: {
		medium: 'bg-feedback-error-tint text-feedback-error dark:bg-feedback-error-tint dark:text-feedback-error',
	},
	// A violet stat accent (the interval tile of Prices by Store); stores keep their own tone below.
	accent: {
		medium: 'bg-entity-store text-entity-store-on dark:bg-entity-store dark:text-entity-store-on',
	},
	// Every store icon, wherever it appears.
	store: {
		medium: 'bg-entity-store text-entity-store-on dark:bg-entity-store dark:text-entity-store-on',
	},
} as const

const SIZES = {
	stat: { box: 'size-7 rounded-lg', icon: 'size-4' },
	saved: { box: 'size-16 rounded-[20px]', icon: 'size-8' },
	// The tile at the top of an empty card (64px, 20px radius).
	empty: { box: 'size-16 rounded-[20px]', icon: 'size-7.5' },
	// The tile of a drop target (48px, 16px radius).
	dropzone: { box: 'size-12 rounded-2xl', icon: 'size-6' },
	xs: { box: 'size-6 rounded-lg', icon: 'size-3.5' },
	sm: { box: 'size-8 rounded-lg', icon: 'size-4.5' },
	md: { box: 'size-9 rounded-xl', icon: 'size-4.5' },
	// Alert reference tiles keep the 32px library size with a 10px radius.
	alert: { box: 'size-8 rounded-[10px]', icon: 'size-4.5' },
	lg: { box: 'size-10 rounded-xl', icon: 'size-5' },
	xl: { box: 'size-14 rounded-2xl', icon: 'size-6.5' },
} as const

interface Props {
	icon: IconSvgElement
	tone: keyof typeof TONES
	size: keyof typeof SIZES
	/** The 100-level fill every dashboard row, empty state and "Up Next" row shares; it is the default. */
	emphasis?: 'medium'
	className?: string
	testId?: string
	spinning?: boolean
}

/** The rounded, tinted square that carries the icon at the start of a dashboard row or at the top of an empty card. */
export function RowIcon({ icon, tone, size, emphasis = 'medium', className, testId = `decorative-${tone}-icon`, spinning = false }: Props) {
	return (
		<span
			aria-hidden='true'
			data-testid={testId}
			className={cn('flex shrink-0 items-center justify-center', SIZES[size].box, TONES[tone][emphasis], className)}
		>
			<HugeiconsIcon
				icon={icon}
				strokeWidth={1.5}
				className={cn(SIZES[size].icon, spinning && 'animate-spin motion-reduce:animate-none')}
			/>
		</span>
	)
}
