import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils'

interface Props {
	/** `on-dark` for photo/ink surfaces such as the dashboard banner; `default` for paper surfaces. */
	tone?: 'default' | 'on-dark'
	/** `hero` is the roomier pill over the dashboard hero. */
	size?: 'default' | 'hero'
	className?: string
	/** The word that names the state; defaults to "Shopping". */
	label?: string
}

/**
 * Marks a running shopping session. The subtle pulse reinforces the active status; the word "Shopping" carries the
 * meaning, so colour and motion are never the only cues.
 */
export function ActiveShoppingBadge({ tone = 'default', size = 'default', className, label = 'Shopping' }: Props) {
	return (
		<Badge
			variant={tone === 'on-dark' ? 'on-dark' : 'shopping'}
			size={size}
			data-testid='active-shopping-badge'
			className={className}
		>
			<span
				aria-hidden='true'
				className={cn(
					'size-1.5 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full motion-reduce:animate-none bg-blue-600 dark:bg-blue-400',
				)}
			/>
			{label}
		</Badge>
	)
}
