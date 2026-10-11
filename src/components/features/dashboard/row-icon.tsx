import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { cn } from '@/utils'

const TONES = {
	primary: {
		soft: 'bg-blue-50 text-blue-600 dark:bg-primary/10 dark:text-blue-300',
		medium: 'bg-blue-100 text-blue-700 dark:bg-primary/20 dark:text-blue-300',
	},
	ocr: {
		soft: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
		medium: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
	},
	success: {
		soft: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
		medium: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
	},
	warning: {
		soft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
		medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
	},
	danger: {
		soft: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
		medium: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
	},
} as const

const SIZES = {
	xs: { box: 'size-6 rounded-[8px]', icon: 'size-3.5' },
	sm: { box: 'size-8 rounded-[10px]', icon: 'size-[18px]' },
	md: { box: 'size-9 rounded-[12px]', icon: 'size-[18px]' },
	lg: { box: 'size-10 rounded-[12px]', icon: 'size-5' },
	xl: { box: 'size-14 rounded-2xl', icon: 'size-[26px]' },
} as const

interface Props {
	icon: IconSvgElement
	tone: keyof typeof TONES
	size: keyof typeof SIZES
	/** `soft` is the pale 50-level fill of list rows; `medium` the stronger 100-level fill of empty states and "Up Next". */
	emphasis?: 'soft' | 'medium'
	className?: string
}

/** The rounded, tinted square that carries the icon at the start of a dashboard row or at the top of an empty card. */
export function RowIcon({ icon, tone, size, emphasis = 'soft', className }: Props) {
	return (
		<span
			aria-hidden='true'
			className={cn('flex shrink-0 items-center justify-center', SIZES[size].box, TONES[tone][emphasis], className)}
		>
			<HugeiconsIcon
				icon={icon}
				strokeWidth={1.5}
				className={SIZES[size].icon}
			/>
		</span>
	)
}
