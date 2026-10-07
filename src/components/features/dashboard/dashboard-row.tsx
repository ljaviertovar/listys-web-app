import type { ReactNode } from 'react'
import Link from 'next/link'

import { cn } from '@/utils'
import { FOCUS_RING } from './helpers/dashboard-styles'

interface Props {
	href: string
	title: string
	meta?: string
	/** Receipt and session metadata (merchant, dates) is source data, so it is set in mono (DESIGN.md §4.1). */
	monoMeta?: boolean
	leading?: ReactNode
	trailing?: ReactNode
	testId: string
	className?: string
}

/** One linked line inside a dashboard section card: optional icon, a title with metadata, and a trailing value or badge. */
export function DashboardRow({ href, title, meta, monoMeta = false, leading, trailing, testId, className }: Props) {
	return (
		<Link
			href={href}
			data-testid={testId}
			className={cn(
				// 12px radius and the 56px minimum height of list rows; hover is a soft slate wash.
				'flex min-h-14 items-center gap-3 rounded-[12px] px-3 py-2 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-muted',
				FOCUS_RING,
				className,
			)}
		>
			{leading}
			<span className='flex min-w-0 flex-1 flex-col gap-1'>
				<span className='truncate text-sm font-semibold leading-[1.2] text-foreground'>{title}</span>
				{meta ? (
					<span
						className={cn(
							'truncate text-muted-foreground',
							monoMeta ? 'font-mono text-xs font-medium leading-[1.55] tracking-[0.01em]' : 'text-[13px] leading-[1.55]',
						)}
					>
						{meta}
					</span>
				) : null}
			</span>
			{trailing}
		</Link>
	)
}
