import { cn } from '@/utils'
import type { NavCount } from './sidebar/helpers/build-nav-counts'

const TONES = {
	neutral: 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
	waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
} as const

interface Props {
	count: NavCount
	testId: string
	className?: string
}

/** The small number at the end of a navigation link: 22px high, round, and pushed to the right edge. */
export function NavCountPill({ count, testId, className }: Props) {
	return (
		<span
			aria-label={count.label}
			data-testid={testId}
			className={cn(
				'ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px] text-xs font-semibold tabular-nums',
				TONES[count.tone],
				className,
			)}
		>
			{count.value}
		</span>
	)
}
