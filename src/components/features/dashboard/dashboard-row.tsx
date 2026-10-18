import type { ReactNode } from 'react'
import Link from 'next/link'

import { cn } from '@/utils'

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

/** One linked line inside a dashboard section card: optional icon, a title with metadata, and a trailing value or status. */
export function DashboardRow({ href, title, meta, monoMeta = false, leading, trailing, testId, className }: Props) {
	return (
		<Link
			href={href}
			data-testid={testId}
			className={cn(
				'flex items-center gap-3 rounded-[14px] px-2 py-2.5 transition-colors duration-150',
				'hover:bg-background dark:hover:bg-muted',
				'focus-ring',
				className,
			)}
		>
			{leading}
			<span className='flex min-w-0 flex-1 flex-col gap-1'>
				<span
					title={title}
					className='truncate text-sm leading-[1.3] font-semibold text-foreground'
				>
					{title}
				</span>
				{meta ? (
					<span
						className={cn(
							'text-slate-500 dark:text-muted-foreground',
							monoMeta ? 'line-clamp-2 font-mono text-xs leading-normal font-medium ' : 'text-sm leading-[1.5]',
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
