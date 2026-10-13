'use client'

import { memo } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'

import { FOCUS_RING } from './helpers/a1-surface'
import { cn } from '@/utils'

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	label: string
	/** `screen` is the A1 header link: 44px target, slate text, no extra margin; it sits above a screen title. */
	variant?: 'inline' | 'screen'
}

function BackLinkContent({ href, label, variant = 'inline' }: Props) {
	const screen = variant === 'screen'

	return (
		<Link
			href={href}
			data-testid='back-link'
			className={cn(
				'group flex w-fit items-center transition-colors',
				screen
					? cn(
							'-ml-2 min-h-11 gap-0.5 rounded-[12px] pr-3 pl-1.5 font-display text-sm font-semibold text-slate-600 hover:bg-[#E9ECF0] hover:text-foreground dark:hover:bg-muted',
							FOCUS_RING,
						)
					: 'mb-4 md:mb-6 text-sm text-accent-foreground hover:text-primary',
			)}
		>
			<HugeiconsIcon
				icon={ArrowLeft01Icon}
				strokeWidth={screen ? 1.8 : 2}
				className={cn('h-4 w-4 transition-transform', !screen && 'group-hover:-translate-x-1')}
			/>
			{label}
		</Link>
	)
}

export default memo(BackLinkContent)
