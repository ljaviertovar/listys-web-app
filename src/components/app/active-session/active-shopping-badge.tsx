import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils'

interface Props {
	/** `on-dark` for photo/ink surfaces such as the dashboard banner; `default` for paper surfaces. */
	tone?: 'default' | 'on-dark'
	className?: string
}

/**
 * Marks a running shopping session. Green is the "running and healthy" colour of the status family; the dot is static
 * (DESIGN.md §9 forbids ambient pulsing) and the word "Shopping" carries the meaning, so colour is never the only cue.
 */
export function ActiveShoppingBadge({ tone = 'default', className }: Props) {
	return (
		<Badge
			variant='completed'
			data-testid='active-shopping-badge'
			className={cn('gap-2', tone === 'on-dark' && 'bg-white/15 text-white dark:text-white', className)}
		>
			<span
				aria-hidden='true'
				className={cn('size-2 rounded-full', tone === 'on-dark' ? 'bg-green-400' : 'bg-green-600 dark:bg-green-400')}
			/>
			Shopping
		</Badge>
	)
}
