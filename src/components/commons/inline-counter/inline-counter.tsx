interface InlineCounterProps {
	count: number
	one: string
	many: string
	size?: 'default' | 'compact'
	testId?: string
}

/**
 * Inline counter (canvas 4/7): the number in IBM Plex Mono beside its label in Inter grey, with no box and no colour, so it is never
 * taken for a status. The label follows the number ("1 receipt", "3 receipts").
 */
export function InlineCounter({ count, one, many, size = 'default', testId = 'inline-counter' }: InlineCounterProps) {
	return (
		<span
			data-testid={testId}
			data-size={size}
			className='inline-flex items-baseline gap-1.5 text-sm leading-none text-muted-foreground dark:text-muted-foreground'
		>
			<b className={size === 'compact' ? 'font-mono text-sm font-semibold text-foreground tabular-nums' : 'font-mono text-base font-semibold text-foreground tabular-nums'}>{count}</b>
			{` ${count === 1 ? one : many}`}
		</span>
	)
}
