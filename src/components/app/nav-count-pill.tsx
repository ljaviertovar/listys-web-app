import { Badge } from '@/components/ui/badge'
import type { NavCount } from './sidebar/helpers/build-nav-counts'

interface Props {
	count: NavCount
	testId: string
	className?: string
}

/** The small number at the end of a navigation link: 22px high, round, and pushed to the right edge. */
export function NavCountPill({ count, testId, className }: Props) {
	return (
		<Badge
			aria-label={count.label}
			data-testid={testId}
			variant={count.tone === 'waiting' ? 'default' : 'secondary'}
			className={className ? `ml-auto ${className}` : 'ml-auto'}
		>
			{count.value}
		</Badge>
	)
}
